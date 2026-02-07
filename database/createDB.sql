CREATE DATABASE IF NOT EXISTS moviedb;
USE moviedb;

CREATE TABLE IF NOT EXISTS movies (
    tconst VARCHAR(10) PRIMARY KEY,
    primaryTitle TEXT NOT NULL,
    isAdult TINYINT(1) NOT NULL,
    averageRating DECIMAL(3,1),
    numVotes INT
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
    role   VARCHAR(50) NOT NULL,
    PRIMARY KEY(tconst, nconst, role)
);

LOAD DATA INFILE '/datasets/IMDb/filtered/movies.tsv'
INTO TABLE movies
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, primaryTitle, isAdult, averageRating, numVotes);

LOAD DATA INFILE '/datasets/IMDb/filtered/genres.tsv'
INTO TABLE genres
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(genreID, genre);

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
(nconst, primaryName, birthYear, deathYear);

LOAD DATA INFILE '/datasets/IMDb/filtered/movie_contributors.tsv'
INTO TABLE movie_contributors
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, nconst, role);

LOAD DATA INFILE '/datasets/IMDb/filtered/popular_works.tsv'
INTO TABLE popular_works
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(nconst, tconst);
