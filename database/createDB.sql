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
    birthYear INT NOT NULL,
    deathYear INT NOT NULL
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

CREATE TABLE IF NOT EXISTS user_ratings (
    user_id VARCHAR(64) NOT NULL,
    tconst VARCHAR(10) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    tstamp DATETIME,
    PRIMARY KEY(user_id, tconst)
);

CREATE TABLE IF NOT EXISTS user_personalities (
    user_id VARCHAR(64) NOT NULL PRIMARY KEY,
    openness DECIMAL(3, 1) NOT NULL,
    agreeableness DECIMAL(3, 1) NOT NULL,
    emotional_stability DECIMAL(3, 1) NOT NULL,
    conscientiousness DECIMAL(3, 1) NOT NULL,
    extraversion DECIMAL(3, 1) NOT NULL
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
(nconst, @raw_name, birthYear, deathYear)
SET primaryName = TRIM(
    REPLACE(
        REPLACE(@raw_name, '\r', ''),
        '\n', ''
    )
);


LOAD DATA INFILE '/datasets/IMDb/filtered/movie_contributors.tsv'
IGNORE
INTO TABLE movie_contributors
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, nconst, role);

SHOW WARNINGS;

LOAD DATA INFILE '/datasets/IMDb/filtered/popular_works.tsv'
INTO TABLE popular_works
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(nconst, @raw_name)
SET tconst = TRIM(
    REPLACE(
        REPLACE(@raw_name, '\r', ''),
        '\n', ''
    )
);

LOAD DATA INFILE '/datasets/personality-isf2018/filtered/ratings.csv'
IGNORE
INTO TABLE user_ratings
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id, tconst, rating, @raw_tstamp)
SET tstamp = TRIM(@raw_tstamp);

LOAD DATA INFILE '/datasets/personality-isf2018/filtered/personality.csv'
IGNORE
INTO TABLE user_personalities
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id,openness,agreeableness,emotional_stability,conscientiousness,extraversion);

SHOW WARNINGS;