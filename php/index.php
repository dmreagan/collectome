<?php
error_reporting(E_STRICT);

require 'vendor/autoload.php';

$config = parse_ini_file('app.ini');

class CrateResource extends \Slim\Slim
{
    public $conn;
    public $config;
    public $SNAPSHOTS_BLOB_TABLE_NAME;
    public $EXHIBITS_TABLE_NAME;

    public $GITHUB_CLIENT_ID;
    public $GITHUB_CLIENT_SECRET;

    public $ERROR_LOG_PATH;

    function __construct($config)
    {
        parent::__construct();
        $this->config = $config;
        
        $this->SNAPSHOTS_BLOB_TABLE_NAME = $config['snapshots_blob_table'];
        $this->EXHIBITS_TABLE_NAME = $config['exhibits_table'];

        $this->GITHUB_CLIENT_ID = getenv($config['git_client_id_env']);
        $this->GITHUB_CLIENT_SECRET = getenv($config['git_client_secret_env']);

        $this->ERROR_LOG_PATH = $config['error_log_path'];

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
    $qry = $app->conn->prepare("SELECT digest, last_modified FROM blob.{$app->SNAPSHOTS_BLOB_TABLE_NAME}");
    $qry->execute();
    $result = $qry->fetchAll(PDO::FETCH_ASSOC);
    $app->success(200, $result);
})->name('snapshots-get');

/**
 * inserts a snapshots
 */
$app->post('/snapshots', function() use ($app)
{
    error_log("In post snapshot" . "\n", 3, $app->ERROR_LOG_PATH);

    $data = json_decode($app->request->getBody());

    if (!isset($data->snapshot)) {
        $app->argument_required('Argument "snapshot" is required');
        return;
    }

    $content = base64_decode($data->snapshot);
    $digest  = sha1($content);

    error_log("Calculated snapshot digest is: {$digest}" . "\n", 3, $app->ERROR_LOG_PATH);

    /////////////////////////////////////////////////////////////////////////
    // check if digest is already in db, if yes, no need to do the insertion
    /////////////////////////////////////////////////////////////////////////
    $qry = $app->conn->prepare("SELECT digest FROM blob.{$app->SNAPSHOTS_BLOB_TABLE_NAME} WHERE digest = ?");
    $qry->bindParam(1, $digest);

    $qry->execute();
    $result = $qry->fetchAll(PDO::FETCH_ASSOC);

    if ($result) {
        error_log("Digest {$result[0]['digest']} already in database, skip insertion" . "\n", 3, $app->ERROR_LOG_PATH);
        
        $app->success(201, array(
            'url' => "/snapshot/{$digest}",
            'digest' => $digest
        ));

        return;
    }
    
    /////////////////////////////////////////////////
    // digest not in db, go ahead insert the snapshot
    /////////////////////////////////////////////////
    error_log("Digest post url: {$app->config['blob_url']}{$app->SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}" . "\n", 
        3, $app->ERROR_LOG_PATH);

    $ch = curl_init("{$app->config['blob_url']}{$app->SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($ch);
    $info   = curl_getinfo($ch);

    curl_close($ch);

    // error_log(print_r($info, TRUE) ."\nEnd Info\n\n", 3, "/var/tmp/my-errors.log");
    if ($info['http_code'] != 201) {
        error_log("Error in posting snapshot" . "\n", 3, $app->ERROR_LOG_PATH);
        error_log("Error code: {$info['http_code']}" . "\n", 3, $app->ERROR_LOG_PATH);

        $app->resource_error($info['http_code'], 'Failed to post snapshot', $digest);
        return;
    } else {
        error_log("Successfully posting snapshot" . "\n", 3, $app->ERROR_LOG_PATH);

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

    $ch = curl_init("{$app->config['blob_url']}{$app->SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");
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

    curl_close($ch);
})->name('snapshot-get');

/**
 * deletes a snapshot that is saved in the blobstore with the given digest.
 */
$app->delete('/snapshot/:digest', function($digest) use ($app)
{
    error_log("In delete snapshot" . "\n", 3, $app->ERROR_LOG_PATH);

    if (empty($digest)) {
        $app->not_found('Please provide a snapshot digest: /snapshot/<digest>');
        return;
    }

    error_log("Delete snapshot url: {$app->config['blob_url']}{$app->SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}" . "\n",
        3, $app->ERROR_LOG_PATH);
    
    $ch = curl_init("{$app->config['blob_url']}{$app->SNAPSHOTS_BLOB_TABLE_NAME}/{$digest}");

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    $result = curl_exec($ch);
    $info   = curl_getinfo($ch);
    if ($info['http_code'] == 404) {
        $app->not_found("Snapshot with digest=\"{$digest}\" not found");
    } else if ($info['http_code'] == 204) {
        error_log("Snapshot being deleted successfully, with digest {$digest}" . "\n", 3, $app->ERROR_LOG_PATH);

        $app->response->setStatus(204);
    } else {
        $err = curl_error($ch);
        $app->resource_error(500, "Could not delete snapshot: {$err}");
    }

    curl_close($ch);
})->name('snapshot-delete');


$app->post('/exhibits', function() use ($app)
{
  
    error_log("In post exhibit" . "\n", 3, $app->ERROR_LOG_PATH);
    error_log("show request body" . "\n", 3, $app->ERROR_LOG_PATH);
    error_log("{$app->request->getBody()}" . "\n", 3, $app->ERROR_LOG_PATH);

    $data            = json_decode($app->request->getBody());
    $title           = $data->config->metadata->name;
    $description     = $data->config->metadata->description;
    $tags            = $data->config->metadata->tags;
    $public          = $data->config->metadata->public;

    $columns         = $data->config->display->columns;
    $rows            = $data->config->display->rows;
    $tile_x_res      = $data->config->display->tile_x_resolution;
    $tile_y_res      = $data->config->display->tile_y_resolution;

    $disciplines     = $data->extra->disciplines;
    $institutions    = $data->extra->institutions;
    $snapshot_ref    = $data->extra->snapshotRef;
    $people          = $data->extra->authors;
   
    $create_time     = $data->createTime;

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

    error_log("Done sanity check" . "\n", 3, $app->ERROR_LOG_PATH);

    $id        = uniqid();

    $qry       = $app->conn->prepare("INSERT INTO {$app->EXHIBITS_TABLE_NAME} (
      id, title, description, disciplines, institutions, tags, snapshot_ref, people, public, columns, rows, 
      tile_x_resolution, tile_y_resolution, config, create_time, last_modified_time
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
    // last_modified_time is the same as create_time when exhibit is created
    $qry->bindParam(16, $create_time);

    // var_dump($qry);

    $state = $qry->execute();

    if ($state) {
        $app->refreshTable($app->EXHIBITS_TABLE_NAME);
  
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
 * edits an exhibit with a given id.
 */
$app->put('/exhibit/:id/edit', function($id) use ($app)
{
    error_log("In update exhibit" . "\n", 3, $app->ERROR_LOG_PATH);
    error_log("show request body" . "\n", 3, $app->ERROR_LOG_PATH);
    error_log("{$app->request->getBody()}" . "\n", 3, $app->ERROR_LOG_PATH);

    $data            = json_decode($app->request->getBody());
    $title           = $data->config->metadata->name;
    $description     = $data->config->metadata->description;
    $tags            = $data->config->metadata->tags;
    $public          = $data->config->metadata->public;

    $columns         = $data->config->display->columns;
    $rows            = $data->config->display->rows;
    $tile_x_res      = $data->config->display->tile_x_resolution;
    $tile_y_res      = $data->config->display->tile_y_resolution;

    $disciplines     = $data->extra->disciplines;
    $institutions    = $data->extra->institutions;
    $snapshot_ref    = $data->extra->snapshotRef;
    $people          = $data->extra->authors;
   
    $last_modified_time     = $data->lastModifiedTime;
  
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

    error_log("Done sanity check" . "\n", 3, $app->ERROR_LOG_PATH);

    $qry = $app->conn->prepare("UPDATE {$app->EXHIBITS_TABLE_NAME}
                                SET title = ?, 
                                description = ?, 
                                disciplines = ?, 
                                institutions = ?, 
                                tags = ?, 
                                snapshot_ref = ?, 
                                people = ?, 
                                public = ?, 
                                columns = ?, 
                                rows = ?, 
                                tile_x_resolution = ?, 
                                tile_y_resolution = ?, 
                                config = ?, 
                                last_modified_time = ?
                                WHERE id=?");

    $qry->bindParam(1, $title);
    $qry->bindParam(2, $description);
    $qry->bindParam(3, $disciplines);
    $qry->bindParam(4, $institutions);
    $qry->bindParam(5, $tags);
    $qry->bindParam(6, $snapshot_ref);
    $qry->bindParam(7, $people);
    $qry->bindParam(8, $public);
    $qry->bindParam(9, $columns);
    $qry->bindParam(10, $rows);
    $qry->bindParam(11, $tile_x_res);
    $qry->bindParam(12, $tile_y_res);
    $qry->bindParam(13, json_encode($data->config));
    $qry->bindParam(14, $last_modified_time);
    $qry->bindParam(15, $id);

    $state = $qry->execute();

})->name('exhibit-put');

/**
 * Get the exhibit for a given id.
 */
$app->get('/exhibit/:id', function($id) use ($app)
{
   $qry = $app->conn->prepare("SELECT *
           FROM {$app->EXHIBITS_TABLE_NAME} AS p
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

/**
 * deletes an exhibit with a given id.
 */
$app->delete('/exhibits/:id', function($id) use ($app)
{
    if (empty($id)) {
        $app->not_found('Please provide a post id: /exhibits/<id>');
        return;
    }
    $qry = $app->conn->prepare("SELECT * FROM {$app->EXHIBITS_TABLE_NAME} WHERE id = ?");
    $qry->bindParam(1, $id);

    $qry->execute();
    $result = $qry->fetchAll(PDO::FETCH_ASSOC);

    if (!$result) {
        $app->not_found("Post with id=\"{$id}\" not found");
        return;
    }

    $qry = $app->conn->prepare("DELETE FROM {$app->EXHIBITS_TABLE_NAME} WHERE id=?");
    $qry->bindParam(1, $id);

    $state = $qry->execute();

    if ($state) {
      $app->response->setStatus(204);
    } else {
      // nothing deleted?
      $app->not_found("Post with id=\"{$id}\" not deleted");
    }
})->name('exhibit-delete');

/**
 * get collectome web app client id of github
 */
$app->get('/github', function() use ($app)
{
    error_log("In github get app client id" . "\n", 3, $app->ERROR_LOG_PATH);
    error_log("{$app->GITHUB_CLIENT_ID}" . "\n", 3, $app->ERROR_LOG_PATH);

    if (!$app->GITHUB_CLIENT_ID) {
        $app->not_found("Cannot find Github client id");
        return;
    }

    $app->success(200, $app->GITHUB_CLIENT_ID);

})->name('git-app-clientid');

/**
 * inserts a snapshots
 */
$app->post('/github', function() use ($app)
{
    error_log("In github get user email" . "\n", 3, $app->ERROR_LOG_PATH);
    
    if (!$app->GITHUB_CLIENT_ID || !$app->GITHUB_CLIENT_SECRET) {
        $app->not_found("Cannot find Github client id/secret");
        return;
    }

    $data = json_decode($app->request->getBody());
    $code = $data->code;

    /******** get access token **********/

    error_log("$code" . "\n", 3, $app->ERROR_LOG_PATH);

    $url = "https://github.com/login/oauth/access_token";

    $params = "client_id={$app->GITHUB_CLIENT_ID}&client_secret={$app->GITHUB_CLIENT_SECRET}&code={$code}";

    error_log("{$params}" . "\n", 3, $app->ERROR_LOG_PATH);

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_POST, true);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));

    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);

    $result = curl_exec($ch);

    curl_close($ch);
 
    error_log("$result" . "\n", 3, $app->ERROR_LOG_PATH);

    $data = json_decode($result);
    $access_token = $data->access_token;

    if (empty($access_token)) {
        error_log("Cannot get access token from github" . "\n", 3, $app->ERROR_LOG_PATH);
        $app->not_found("Cannot get GitHub access token!");
        return;
    }

    error_log("Get access token from github: '{$access_token}'" . "\n", 3, $app->ERROR_LOG_PATH);

    /******** get user email **********/

    $url = "https://api.github.com/user";

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $user_agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36";

    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: token ${access_token}", "User-Agent: ${user_agent}"));

    $result = curl_exec($ch);

    curl_close($ch);

    error_log("$result" . "\n", 3, $app->ERROR_LOG_PATH);

    if (!$result) {
        $app->not_found("Cannot find user GitHub profile!");
    } else {
        $app->success(200, $result);
    }

})->name('git-user-email');

$app->run();
?>