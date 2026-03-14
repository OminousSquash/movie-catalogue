from mysql.connector import MySQLConnection, Error
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO
from fastapi import HTTPException, status
from backend.utils.redis_client import redis_client
from backend.utils.json_utils import make_json_safe
import json

def get_genre_trend_service(db: MySQLConnection):
    try:
        cache_key = "genre_trends"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        trend_analytics_query = """
        SELECT  
            STDDEV(m.average_rating) AS std_rating,
            FLOOR(m.start_year / 10) * 10 AS decade,
            g.genre,
            AVG(m.average_rating) AS avg_rating,
            SUM(m.num_votes) as total_votes
        FROM movies m
        JOIN movie_genres mg ON m.tconst = mg.tconst
        JOIN genres g ON g.genre_id = mg.genre_id
        GROUP BY g.genre, decade
        ORDER BY decade DESC, total_votes DESC
        """

        cursor.execute(trend_analytics_query)
        result = cursor.fetchall()

        redis_result = make_json_safe(result)
        redis_client.set(cache_key, json.dumps(redis_result), ex=3600)

        return result

    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

def get_contributor_trends_service(
    db: MySQLConnection,
    genre_contributor_dto: GenreContributorTrendAnalysisDTO
):
    try:
        genres = genre_contributor_dto.genres or []
        last_decade = genre_contributor_dto.last_decade

        genres_key = ",".join(sorted(genres)) if genres else "all"
        decade_key = "last_decade" if last_decade else "all_time"

        cache_key = f"contributor_trends:{genres_key}:{decade_key}"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        query = """
            SELECT
                c.nconst,
                c.primary_name AS name,
                COUNT(DISTINCT m.tconst) AS movies_cnt,
                SUM(m.num_votes) AS total_votes
            FROM contributors c
            JOIN movie_contributors mc ON mc.nconst = c.nconst
            JOIN movies m ON m.tconst = mc.tconst
        """

        conditions = []
        params = []

        if genre_contributor_dto.genres:
            genres = genre_contributor_dto.genres
            placeholders = ",".join(["%s"] * len(genres))
            check_genres_exist_query = f"""
            SELECT COUNT(genre) AS genre_count
            FROM genres
            WHERE genre in ({placeholders})
            """
            cursor.execute(check_genres_exist_query, genres)
            if cursor.fetchone()["genre_count"] != len(genres):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more genres are not found")
            conditions.append(f"""
                EXISTS (
                    SELECT 1
                    FROM movie_genres mg
                    JOIN genres g ON g.genre_id = mg.genre_id
                    WHERE mg.tconst = m.tconst
                    AND g.genre IN ({placeholders})
                )
            """)
            params.extend(genres)

        if genre_contributor_dto.last_decade:
            conditions.append("""
                m.start_year >= (
                    SELECT FLOOR(MAX(start_year) / 10) * 10 FROM movies
                )
            """)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += """
            GROUP BY c.nconst, c.primary_name
            ORDER BY total_votes DESC
            LIMIT 5
        """

        cursor.execute(query, params)
        result = cursor.fetchall()
        redis_result = make_json_safe(result)
        redis_client.set(cache_key, json.dumps(redis_result), ex=3600)
        return result

    except HTTPException:
        raise
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

