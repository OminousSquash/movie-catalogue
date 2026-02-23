from mysql.connector import MySQLConnection
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO

def get_rating_harshness_service(db:MySQLConnection):
    cursor = db.cursor(dictionary = True)
    query = """
    SELECT 
    CASE 
        WHEN avg_rating <= 2.5 THEN 'Harsh'
        WHEN avg_rating >= 4.0 THEN 'Generous'
        ELSE 'Moderate'
    END AS rater_type,
    COUNT(*) AS num_users
    FROM (
        SELECT user_id, AVG(rating) AS avg_rating
        FROM user_ratings
        GROUP BY user_id
    ) AS user_avgs
    GROUP BY rater_type; 
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_low_rating_genres_service(db:MySQLConnection):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT 
        genre,
        COUNT(*) AS num_users_with_low_preference
    FROM (
        SELECT 
            ur.user_id,
            g.genre,
            AVG(ur.rating) AS avg_genre_rating,
            SUM(ur.rating <= 2) / COUNT(*) AS low_ratio,
            COUNT(*) AS ratings_in_genre
        FROM user_ratings ur
        JOIN movie_genres mg ON ur.tconst = mg.tconst
        JOIN genres g ON g.genreID = mg.genreID
        GROUP BY ur.user_id, g.genre
    ) u
    WHERE low_ratio > 0.5
    GROUP BY genre
    """

    cursor.execute(query)
    return cursor.fetchall()

import pandas as pd

def get_correlation_matrix_service(db: MySQLConnection):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT
        ur.user_id,
        g.genre,
        AVG(ur.rating) AS avg_genre_rating
    FROM user_ratings ur
    JOIN movie_genres mg ON ur.tconst = mg.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY ur.user_id, g.genre
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    df = pd.DataFrame(rows)

    user_genre_matrix = df.pivot_table(
        index="user_id",
        columns="genre",
        values="avg_genre_rating"
    )

    correlation_matrix = user_genre_matrix.corr(method="pearson")

    return correlation_matrix.to_dict()