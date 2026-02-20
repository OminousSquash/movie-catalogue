CREATE DATABASE IF NOT EXISTS moviedb;
USE moviedb;

CREATE TABLE IF NOT EXISTS movies (
    tconst VARCHAR(10) PRIMARY KEY,
    primaryTitle TEXT NOT NULL,
    isAdult TINYINT(1) NOT NULL,
    averageRating DECIMAL(3,1),
    numVotes INT,
    startYear INT,
    runtimeMinutes INT
);

CREATE TABLE IF NOT EXISTS genres (
    genreID INT PRIMARY KEY,
    genre TEXT
);

CREATE TABLE IF NOT EXISTS movie_genres(
    tconst VARCHAR(10) NOT NULL,
    genreID INT NOT NULL,
    PRIMARY KEY (tconst, genreID)
);

CREATE TABLE IF NOT EXISTS contributors (
    nconst VARCHAR(10) NOT NULL PRIMARY KEY,
    primaryName VARCHAR(255) NOT NULL,
    birthYear INT,
    deathYear INT
);

CREATE TABLE IF NOT EXISTS popular_works(
    nconst VARCHAR(10) NOT NULL,
    tconst VARCHAR(10) NOT NULL,
    PRIMARY KEY(nconst, tconst)
);

CREATE TABLE IF NOT EXISTS movie_contributors (
    tconst VARCHAR(10) NOT NULL,
    nconst VARCHAR(10) NOT NULL,
    role   VARCHAR(255) NOT NULL,
    PRIMARY KEY(tconst, nconst, role)
);

CREATE TABLE IF NOT EXISTS links (
    movieId INT PRIMARY KEY,
    imdbId VARCHAR(10),
    tmdbId INT
);

CREATE TABLE IF NOT EXISTS movielens_tags(
    userId INT NOT NULL,
    movieId INT NOT NULL,
    tag VARCHAR(255) NOT NULL,
    timestamp BIGINT,
    PRIMARY KEY (userId, movieId, tag)
);

LOAD DATA INFILE '/datasets/IMDb/filtered/movies.tsv'
INTO TABLE movies
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, primaryTitle, isAdult, averageRating, numVotes, startYear, runtimeMinutes);

LOAD DATA INFILE '/datasets/IMDb/filtered/genres.tsv'
INTO TABLE genres
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(genreID, @raw_genre)
SET genre = TRIM(
    REPLACE(
        REPLACE(@raw_genre, '\r', ''),
        '\n', ''
    )
);


LOAD DATA INFILE '/datasets/IMDb/filtered/movies_genres.tsv'
INTO TABLE movie_genres
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, genreID);

LOAD DATA INFILE '/datasets/IMDb/filtered/contributors.tsv'
INTO TABLE contributors
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(nconst, @raw_name, @raw_birthYear, @raw_deathYear)
SET 
    primaryName = TRIM(
        REPLACE(
            REPLACE(@raw_name, '\r', ''),
            '\n', '')
    ),
    birthYear = IF(@raw_birthYear = '-1', NULL, CAST(@raw_birthYear AS SIGNED)),
    deathYear = IF(@raw_deathYear = '-1', NULL, CAST(@raw_deathYear AS SIGNED));


LOAD DATA INFILE '/datasets/IMDb/filtered/movie_contributors.tsv'
IGNORE
INTO TABLE movie_contributors
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, nconst, @raw_role)
SET role = TRIM(
    REPLACE(@raw_role, '\r', '')
);

SHOW WARNINGS;

LOAD DATA INFILE '/datasets/IMDb/filtered/popular_works.tsv'
INTO TABLE popular_works
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(nconst, @raw_tconst)
SET tconst = TRIM(
    REPLACE(
        REPLACE(@raw_tconst, '\r', ''), 
        '\n', '')
);

LOAD DATA INFILE '/datasets/ml-latest-small/links.csv'
INTO TABLE links
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(movieId, imdbId, tmdbId);


LOAD DATA INFILE '/datasets/ml-latest-small/tags.csv'
INTO TABLE movielens_tags
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(userId, movieId, @raw_tag, timestamp)
SET tag = TRIM(
    REPLACE(
        REPLACE(
            @raw_tag, '\r', ''),
            '\n', '')
);
SHOW WARNINGS;