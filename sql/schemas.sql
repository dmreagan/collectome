-- posts table
DROP TABLE IF EXISTS guestbook.posts;

-- countries table
DROP TABLE IF EXISTS guestbook.countries;

-- images blob table
DROP BLOB TABLE IF EXISTS guestbook_images;

-- custom text analyzer
CREATE ANALYZER exhibitanalyzer (
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
    title STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    description STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    disciplines STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    institutions STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    tags STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    snapshot_ref STRING,
    people STRING INDEX USING FULLTEXT WITH (analyzer = 'exhibitanalyzer'),
    public BOOLEAN,
    columns INTEGER,
    rows INTEGER,
    tile_x_resolution INTEGER,
    tile_y_resolution INTEGER,
    config STRING,
    create_time STRING,
    last_modified_time STRING,
    owner STRING
) WITH (number_of_replicas = 0);

-- snapshots blob table
DROP BLOB TABLE IF EXISTS exhibit_snapshots;
CREATE BLOB TABLE exhibit_snapshots
WITH (number_of_replicas = 0);
