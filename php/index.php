<?php
error_reporting(E_STRICT);

require 'vendor/autoload.php';

$config = parse_ini_file('app.ini');

$SNAPSHOTS_BLOB_TABLE_NAME = $config['snapshots_blob_table'];

$EXHIBITS_TABLE_NAME = $config['exhibits_table'];

class CrateResource extends \Slim\Slim
{
    public $conn;
    public $config;

    function __construct($config)
    {
        parent::__construct();
        $this->config = $config;
        $dsn = "{$config['db_host']}:{$config['db_port']}";
        $this->conn = new Crate\PDO\PDO($dsn, null, null, null);
    }

    function refreshTable($table)
    {
        $qry = $this->conn->prepare("REFRESH TABLE {$table}");
        $result = $qry->execute();
    }

    function argument_required($message)
    {
        $this->resource_error(400, $message);
    }

    function not_found($message)
    {
        $this->resource_error(404, $message);
    }

    function resource_error($status, $message, $check = NULL, $contenttype = 'application/json')
    {
        $this->response->headers->set('Content-Type', $contenttype);
        $this->response->setStatus($status);
        $this->response->write(json_encode(array(
            "error" => $message,
            "status" => $status,
            "check" => $check
        )));
    }

    function success($status, $result, $contenttype = 'application/json')
    {
        $this->response->headers->set('Content-Type', $contenttype);
        $this->response->setStatus($status);
        $this->response->write(json_encode($result));
    }

}

$app = new CrateResource($config);

// apply CORS headers to all responses
$app->add(new \CorsSlim\CorsSlim());

/**
 * Default action.
 */
$app->get('/', function() use ($app)
{
    $app->success(200, 'Server up and running');
})->name('default');

/**
 * returns all snapshots that are saved in the crate blob store.
 */
$app->get('/snapshots', function() use ($app)
{
    $qry = $app->conn->prepare("SELECT digest, last_modified FROM blob.{$SNAPSHOTS_BLOB_TABLE_NAME}");
    $qry->execute();
    $result = $qry->fetchAll(PDO::FETCH_ASSOC);
    $app->success(200, $result);
})->name('snapshots-get');

/**
 * inserts a snapshots
 */
$app->post('/snapshots', function() use ($app)
{
    $data = json_decode($app->request->getBody());

    if (!isset($data->snapshot)) {
        $app->argument_required('Argument "snapshot" is required');
        return;
    }

    $content = base64_decode($data->snapshot);
    $digest  = sha1($content);
    $ch = curl_init("{$app->config['blob_url']}{$SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($ch);
    $info   = curl_getinfo($ch);

    // error_log(print_r($info, TRUE) ."\nEnd Info\n\n", 3, "/var/tmp/my-errors.log");
    if ($info['http_code'] != 201) {
        $app->resource_error($info['http_code'], 'The snapshot you generated is being used by another project. Choose a new one', $digest);
        return;
    } else {
        $app->success($info['http_code'], array(
            'url' => "/snapshot/{$digest}",
            'digest' => $digest
        ));
    }
})->name('snapshot-post');

/**
 * returns the snapshot for a given digest.
 */
$app->get('/snapshot/:digest', function($digest) use ($app)
{
    if (empty($digest)) {
        $app->not_found('Please provide a snapshot digest: /snapshot/<digest>');
        return;
    }

    $ch = curl_init("{$app->config['blob_url']}{$SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);

    if (!$result || is_bool($result)) {
        $info = curl_getinfo($ch);
        $app->not_found("Snapshot with digest=\"{$digest}\" not found");
    } else {
        $app->response->headers->set("Content-Type", "image/gif");
        $app->response->headers->set("Content-Length", strlen($result));
        $app->response->setStatus(200);
        $app->response->write($result);
    }
})->name('snapshot-get');

/**
 * deletes a snapshot that is saved in the blobstore with the given digest.
 */
$app->delete('/snapshot/:digest', function($digest) use ($app)
{
    if (empty($digest)) {
        $app->not_found('Please provide a snapshot digest: /snapshot/<digest>');
        return;
    }
    $ch = curl_init("{$app->config['blob_url']}{$SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    $result = curl_exec($ch);
    $info   = curl_getinfo($ch);
    if ($info['http_code'] == 404) {
        $app->not_found("Snapshot with digest=\"{$digest}\" not found");
    } else if ($info['http_code'] == 204) {
        $app->response->setStatus(204);
    } else {
        $err = curl_error($ch);
        $app->resource_error(500, "Could not delete snapshot: {$err}");
    }
})->name('snapshot-delete');


$app->post('/exhibits', function() use ($app)
{
  
    $data            = json_decode($app->request->getBody());
    $title           = $data->config->metadata->name;
    $description     = $data->config->metadata->description;
    $tags            = $data->config->metadata->tags;
    $public           = $data->config->metadata->public;

    $columns         = $data->config->display->columns;
    $rows            = $data->config->display->rows;
    $tile_x_res      = $data->config->display->tile_x_resolution;
    $tile_y_res      = $data->config->display->tile_y_resolution;

    $disciplines     = $data->extra->disciplines;
    $institutions    = $data->extra->institutions;
    $snapshot_ref    = $data->extra->snapshotRef;
    $people          = $data->extra->authors;
   
    $create_time     = $data->create_time;
  
    if (empty($title)) {
      $app->argument_required('Argument "Title" is required');
      return;
    } else if (empty($description)) {
        $app->argument_required('Argument "Description" is required');
        return;
    }else if (empty($institutions)) {
        $app->argument_required('Argument "Institutions" is required');
        return;
    }else if (empty($snapshot_ref)) {
        $app->argument_required('Argument "Snapshot" is required');
        return;
    }

    $id        = uniqid();
    $now       = time() * 1000;
    // $likeCount = 0;

    $qry       = $app->conn->prepare("INSERT INTO {$EXHIBITS_TABLE_NAME} (
      id, title, description, disciplines, institutions, tags, snapshot_ref, people, public, columns, rows, tile_x_resolution, tile_y_resolution, config, create_time
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )");
    $qry->bindParam(1, $id);
    $qry->bindParam(2, $title);
    $qry->bindParam(3, $description);
    $qry->bindParam(4, $disciplines);
    $qry->bindParam(5, $institutions);
    $qry->bindParam(6, $tags);
    $qry->bindParam(7, $snapshot_ref);
    $qry->bindParam(8, $people);
    $qry->bindParam(9, $public);
    $qry->bindParam(10, $columns);
    $qry->bindParam(11, $rows);
    $qry->bindParam(12, $tile_x_res);
    $qry->bindParam(13, $tile_y_res);
    $qry->bindParam(14, json_encode($data->config));
    $qry->bindParam(15, $create_time);
    $state = $qry->execute();

    if ($state) {
        $app->refreshTable($EXHIBITS_TABLE_NAME);
  
        $result = array(
             "success"=>"Exhibit Created!",
             "id" => $id
         );
        $app->success(201, $result, $id);
    } else {
        $app->resource_error(500, $app->conn->errorInfo());
    }
    
})->name('post-exhibit');

/**
 * Get the exhibit for a given id.
 */
$app->get('/exhibit/:id', function($id) use ($app)
{
   $qry = $app->conn->prepare("SELECT *
           FROM {$EXHIBITS_TABLE_NAME} AS p
           WHERE p.id = ?");

   $qry->bindParam(1, $id);
   $qry->execute();

   $result = $qry->fetch(PDO::FETCH_ASSOC);

   if (!$result) {
       $app->not_found("Exhibit with id=\"{$id}\" not found");
   } else {
       $app->success(200, $result);
   }
})->name('exhibit-get');

$app->run();
?>