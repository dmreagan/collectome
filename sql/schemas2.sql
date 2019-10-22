-- posts table
DROP TABLE IF EXISTS guestbook.posts;

-- countries table
DROP TABLE IF EXISTS guestbook.countries;

-- images blob table
DROP BLOB TABLE IF EXISTS guestbook_images;

-- custom text analyzer
CREATE ANALYZER playlistanalyzer (
  TOKENIZER standard,
  TOKEN_FILTERS (
    lowercase,
    stop,
    kstem,
    asciifolding
  )
);

-- projects table
DROP TABLE IF EXISTS playlists;
CREATE TABLE playlists (
    id STRING PRIMARY KEY,
    title STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    description STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    disciplines STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    institutions STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    tags STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    people STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    collections STRING INDEX USING FULLTEXT WITH (analyzer = 'playlistanalyzer'),
    public BOOLEAN,
    config STRING,
    create_time STRING,
    last_modified_time STRING,
    owner STRING
) WITH (number_of_replicas = 0);

