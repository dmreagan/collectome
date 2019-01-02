-- posts table
DROP TABLE IF EXISTS guestbook.posts;

-- countries table
DROP TABLE IF EXISTS guestbook.countries;

-- images blob table
DROP BLOB TABLE IF EXISTS guestbook_images;

-- custom text analyzer
CREATE ANALYZER myanalyzer (
  TOKENIZER standard,
  TOKEN_FILTERS (
    lowercase,
    stop,
    kstem,
    asciifolding
  )
);

-- projects table
DROP TABLE IF EXISTS exhibits;
CREATE TABLE exhibits (
    id STRING PRIMARY KEY,
    title STRING INDEX USING FULLTEXT WITH (analyzer = 'myanalyzer'),
    description STRING INDEX USING FULLTEXT WITH (analyzer = 'myanalyzer'),
    disciplines STRING INDEX USING FULLTEXT WITH (analyzer = 'myanalyzer'),
    institutions STRING INDEX USING FULLTEXT WITH (analyzer = 'myanalyzer'),
    tags ARRAY(STRING),
    snapshot_ref STRING,
    people STRING INDEX USING FULLTEXT WITH (analyzer = 'myanalyzer'),
    public BOOLEAN,
    columns INTEGER,
    rows INTEGER,
    tile_x_resolution INTEGER,
    tile_y_resolution INTEGER,
    config STRING,
    create_time STRING,
    last_modified_time STRING
) WITH (number_of_replicas = 0);

-- snapshots blob table
DROP BLOB TABLE IF EXISTS exhibit_snapshots;
CREATE BLOB TABLE exhibit_snapshots
WITH (number_of_replicas = 0);
