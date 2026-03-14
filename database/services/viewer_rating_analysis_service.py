from mysql.connector import MySQLConnection, Error
from fastapi import HTTPException, status
import pandas as pd
from database.services.redis_client import redis_client
import json


def _validate_genres_exist(cursor, genres: list[str]):
    placeholders = ",".join(["%s"] * len(genres))
    query = f"""
    SELECT COUNT(DISTINCT genre) AS genre_count
    FROM genres
    WHERE genre IN ({placeholders})
    """
    cursor.execute(query, genres)

    if cursor.fetchone()["genre_count"] != len(set(genres)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more genres are not found"
        )

def get_rating_harshness_service(db: MySQLConnection):
    try:
        cache_key = "viewer_harshness"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        query = """
        SELECT 
        CASE 
            WHEN avg_rating <= 2.5 THEN 'Harsh'
            WHEN avg_rating >= 4.0 THEN 'Generous'
            ELSE 'Moderate'
        END AS rater_type,
        COUNT(*) AS num_users
        FROM (
            SELECT dataset_user_id, AVG(rating) AS avg_rating
            FROM dataset_user_ratings
            GROUP BY dataset_user_id
        ) AS user_avgs
        GROUP BY rater_type;
        """

        cursor.execute(query)
        result = cursor.fetchall()

        redis_client.setex(cache_key, 3600, json.dumps(result))

        return result

    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

def get_low_rating_genres_service(db:MySQLConnection):
    try:
        cache_key = "low_rating_genres"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        query = """
        SELECT 
            genre,
            COUNT(*) AS num_users_with_low_preference
        FROM (
            SELECT 
                ur.dataset_user_id,
                g.genre,
                AVG(ur.rating) AS avg_genre_rating,
                SUM(ur.rating <= 2) / COUNT(*) AS low_ratio,
                COUNT(*) AS ratings_in_genre
            FROM dataset_user_ratings ur
            JOIN movie_genres mg ON ur.tconst = mg.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            GROUP BY ur.dataset_user_id, g.genre
        ) u
        WHERE low_ratio > 0.5
        GROUP BY genre
        """

        cursor.execute(query)
        return cursor.fetchall()
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")



def get_correlation_matrix_service(db: MySQLConnection):
    try:

        cache_key = "genre_correlation_matrix"

        cached_result = redis_client.get(cache_key)

        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        query = """
        SELECT
            ur.dataset_user_id,
            g.genre,
            AVG(ur.rating) AS avg_genre_rating
        FROM dataset_user_ratings ur
        JOIN movie_genres mg ON ur.tconst = mg.tconst
        JOIN genres g ON g.genre_id = mg.genre_id
        GROUP BY ur.dataset_user_id, g.genre
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not enough ratings data to calculate correlations"
            )

        df = pd.DataFrame(rows)

        user_genre_matrix = df.pivot_table(
            index="dataset_user_id",
            columns="genre",
            values="avg_genre_rating"
        )

        correlation_matrix = user_genre_matrix.corr(method="pearson")

        result = correlation_matrix.to_dict()

        redis_client.setex(cache_key, 3600, json.dumps(result))

        return result

    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error"
        )


def get_conditional_low_rating_service(db: MySQLConnection, genre_a: str, genre_b: str):
    try:
        cursor = db.cursor(dictionary=True)
        _validate_genres_exist(cursor, [genre_a, genre_b])

        query = """
        WITH user_genre_stats AS (
            SELECT 
                ur.dataset_user_id,
                g.genre,
                SUM(ur.rating <= 2) / COUNT(*) AS low_ratio
            FROM dataset_user_ratings ur
            JOIN movie_genres mg ON ur.tconst = mg.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            GROUP BY ur.dataset_user_id, g.genre
            HAVING COUNT(*) >= 5
        )
        SELECT
            COUNT(DISTINCT a.dataset_user_id) AS users_low_in_a,
            COUNT(DISTINCT b.dataset_user_id) AS users_low_in_b_given_a
        FROM user_genre_stats a
        LEFT JOIN user_genre_stats b
            ON a.dataset_user_id = b.dataset_user_id AND b.genre = %s AND b.low_ratio > 0.5
        WHERE a.genre = %s AND a.low_ratio > 0.5
        """

        cursor.execute(query, (genre_b, genre_a))
        result = cursor.fetchone()

        if result["users_low_in_a"] == 0:
            probability = 0
        else:
            probability = result["users_low_in_b_given_a"] / result["users_low_in_a"]

        return {
            "genre_a": genre_a,
            "genre_b": genre_b,
            "probability": round(probability, 3),
            "sample_size": result["users_low_in_a"]
        }
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error"
        )

def get_conditional_high_rating_service(db: MySQLConnection, genre_a: str, genre_b: str):
    try:
        cursor = db.cursor(dictionary=True)
        _validate_genres_exist(cursor, [genre_a, genre_b])

        query = """
        WITH user_genre_stats AS (
            SELECT
                ur.dataset_user_id,
                g.genre,
                SUM(ur.rating >= 4) / COUNT(*) AS high_ratio
            FROM dataset_user_ratings ur
            JOIN movie_genres mg ON ur.tconst = mg.tconst
            JOIN genres g ON mg.genre_id = g.genre_id
            GROUP BY ur.dataset_user_id, g.genre
            HAVING COUNT(*) >= 5
        )
        SELECT
            COUNT(DISTINCT a.dataset_user_id) AS users_high_in_a,
            COUNT(DISTINCT b.dataset_user_id) AS users_high_in_b_given_a
        FROM user_genre_stats a
        LEFT JOIN user_genre_stats b
            ON a.dataset_user_id = b.dataset_user_id
            AND b.genre = %s
            AND b.high_ratio > 0.5
        WHERE a.genre = %s
          AND a.high_ratio > 0.5
        """

        cursor.execute(query, (genre_b, genre_a))
        result = cursor.fetchone()

        if result["users_high_in_a"] == 0:
            probability = 0
        else:
            probability = result["users_high_in_b_given_a"] / result["users_high_in_a"]

        return {
            "genre_a": genre_a,
            "genre_b": genre_b,
            "probability": round(probability, 3),
            "sample_size": result["users_high_in_a"]
        }
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error"
        )