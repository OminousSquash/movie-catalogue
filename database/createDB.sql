CREATE DATABASE IF NOT EXISTS moviedb;
USE moviedb;


CREATE TABLE IF NOT EXISTS movies (
    tconst VARCHAR(10) PRIMARY KEY,
    primary_title TEXT NOT NULL, 
    is_adult TINYINT(1) NOT NULL,
    average_rating DECIMAL(3,1),
    num_votes INT,
    start_year INT,
    runtime_minutes INT,
    INDEX idx_movies_filter (start_year, average_rating, num_votes)
);

CREATE TABLE IF NOT EXISTS genres (
    genre_id INT PRIMARY KEY,
    genre VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS movie_genres(
    tconst VARCHAR(10) NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (tconst, genre_id),
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE,
    FOREIGN KEY (genre_id) 
        REFERENCES genres(genre_id)
        ON DELETE CASCADE,
    INDEX idx_movie_genres_genre (genre_id)
);

CREATE TABLE IF NOT EXISTS contributors (
    nconst VARCHAR(10) NOT NULL PRIMARY KEY,
    primary_name VARCHAR(255) NOT NULL,
    birth_year INT NOT NULL,
    death_year INT,

    INDEX idx_contributors_name (primary_name)
);

CREATE TABLE IF NOT EXISTS popular_works(
    nconst VARCHAR(10) NOT NULL,
    tconst VARCHAR(10) NOT NULL,
    PRIMARY KEY(nconst, tconst),
    FOREIGN KEY (nconst)
        REFERENCES contributors(nconst)
        ON DELETE CASCADE,
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movie_contributors (
    tconst VARCHAR(10) NOT NULL,
    nconst VARCHAR(10) NOT NULL,
    role   VARCHAR(255) NOT NULL,
    PRIMARY KEY(tconst, nconst, role),
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE,
    FOREIGN KEY (nconst)
        REFERENCES contributors(nconst)
        ON DELETE CASCADE,
    INDEX idx_movie_contributors_lookup (nconst, role)
);


CREATE TABLE IF NOT EXISTS dataset_user_ratings (
    dataset_user_id VARCHAR(64) NOT NULL,
    tconst VARCHAR(10) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    tstamp DATETIME,
    PRIMARY KEY(dataset_user_id, tconst),
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE,

    INDEX idx_dataset_user_ratings_user (dataset_user_id),
    INDEX idx_dataset_user_ratings_movie (tconst)
);


CREATE TABLE IF NOT EXISTS dataset_user_personalities (
    dataset_user_id VARCHAR(64) NOT NULL PRIMARY KEY,
    openness DECIMAL(3, 1) NOT NULL,
    agreeableness DECIMAL(3, 1) NOT NULL,
    emotional_stability DECIMAL(3, 1) NOT NULL,
    conscientiousness DECIMAL(3, 1) NOT NULL,
    extraversion DECIMAL(3, 1) NOT NULL
);


CREATE TABLE IF NOT EXISTS app_users (
    app_user_id INT AUTO_INCREMENT PRIMARY KEY,
    app_username VARCHAR(255) NOT NULL UNIQUE,
    app_user_password_hash VARCHAR(255) NOT NULL,

    INDEX idx_app_users_username (app_username)
);

CREATE TABLE IF NOT EXISTS app_user_lists (
    list_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    app_user_id INT NOT NULL,
    list_name VARCHAR(255) NOT NULL,
    list_note TEXT,
    FOREIGN KEY (app_user_id)
        REFERENCES app_users(app_user_id)
        ON DELETE CASCADE,
    INDEX idx_app_user_lists_user(app_user_id)
);

CREATE TABLE IF NOT EXISTS app_user_list_movies (
    list_id INT NOT NULL,
    tconst VARCHAR(10) NOT NULL,
    PRIMARY KEY(list_id, tconst),
    FOREIGN KEY (list_id)
        REFERENCES app_user_lists(list_id)
        ON DELETE CASCADE,
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oscar_movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tconst VARCHAR(10) NOT NULL,
    award_year INT NOT NULL,
    award_name VARCHAR(255) NOT NULL,
    award_status ENUM('Winner','Nominee') NOT NULL,
    recipient_name VARCHAR(255),
    recipient_nconst VARCHAR(10),

    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id INT PRIMARY KEY NOT NULL,
    tag_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS movie_tags (
    tconst VARCHAR(10) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY(tconst, tag_id),
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE,
    FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS predicted_ratings (
    tconst VARCHAR(10) NOT NULL,
    primary_title TEXT NOT NULL,
    start_year INT,
    predicted_rating DECIMAL(3, 1),
    prediction_uncertainty DECIMAL(4, 2),
    PRIMARY KEY (tconst),
    FOREIGN KEY (tconst)
        REFERENCES movies(tconst)
        ON DELETE CASCADE
);

LOAD DATA INFILE '/datasets/IMDb/filtered/movies.tsv'
INTO TABLE movies
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, primary_title, is_adult, average_rating, num_votes, start_year, runtime_minutes);

LOAD DATA INFILE '/datasets/IMDb/filtered/genres.tsv'
INTO TABLE genres
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(genre_id, @raw_genre)
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
(tconst, genre_id);

LOAD DATA INFILE '/datasets/IMDb/filtered/contributors.tsv'
INTO TABLE contributors
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(nconst, @raw_name, birth_year, death_year)
SET primary_name = TRIM(
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
INTO TABLE dataset_user_ratings
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(dataset_user_id, tconst, rating, @raw_tstamp)
SET tstamp = TRIM(@raw_tstamp);

LOAD DATA INFILE '/datasets/personality-isf2018/filtered/personality.csv'
IGNORE
INTO TABLE dataset_user_personalities
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(dataset_user_id, openness, agreeableness, emotional_stability, conscientiousness, extraversion);


LOAD DATA INFILE '/datasets/ml-latest-small/filtered/tags.csv'
IGNORE
INTO TABLE tags
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tag_id, @raw_tag_name)
SET tag_name = TRIM(BOTH '\r' FROM @raw_tag_name);

SHOW WARNINGS;

LOAD DATA INFILE '/datasets/ml-latest-small/filtered/movie_tags.csv'
IGNORE
INTO TABLE movie_tags 
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, tag_id);

LOAD DATA INFILE '/datasets/IMDb/filtered/oscar_movies.csv'
IGNORE
INTO TABLE oscar_movies
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, award_year, award_name, award_status, recipient_name, @raw_recipient_nconst)
SET recipient_nconst = CASE
    WHEN TRIM(REPLACE(@raw_recipient_nconst, '\r', '')) IN ('\\N', '') THEN NULL
    ELSE TRIM(REPLACE(@raw_recipient_nconst, '\r', ''))
END;

LOAD DATA INFILE 'datasets/IMDb/filtered/recent_predicted_movies.tsv'
IGNORE
INTO TABLE predicted_ratings
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tconst, primary_title, start_year, predicted_rating, prediction_uncertainty);

SHOW WARNINGS;