from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.utils.redis_client import redis_client
import json

def get_contributor_info_service(
    db: MySQLConnection,
    nconst: str
):
    try:
        cache_key = f"contributor_info:{nconst}"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary=True)

        contributor_count_query = """
        SELECT COUNT(DISTINCT nconst) AS contributor_count
        FROM contributors
        WHERE nconst = %s
        """

        stats_query = """
        SELECT
            c.nconst as nconst,
            c.primary_name as name,
            c.birth_year as birth_year,
            c.death_year as death_year,
            COUNT(DISTINCT m.tconst) AS num_movies,
            SUM(m.num_votes) as total_votes,
            AVG(m.average_rating) as avg_rating,
            AVG(m.num_votes) as avg_votes,
            STDDEV(m.average_rating) as rating_std
        FROM movies m
        JOIN movie_contributors mc ON mc.tconst = m.tconst
        JOIN contributors c ON c.nconst = mc.nconst
        WHERE c.nconst = %s
        GROUP BY c.nconst
        """

        popular_movies_query = """
        SELECT m.primary_title
        FROM movies m
        JOIN popular_works pw ON pw.tconst = m.tconst
        JOIN contributors c ON c.nconst = pw.nconst
        WHERE c.nconst = %s
        """

        cursor.execute(contributor_count_query, (nconst,))
        contributor_count = cursor.fetchone()["contributor_count"]

        if contributor_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contributor not found"
            )

        if contributor_count > 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Multiple contributors found for the provided id"
            )

        cursor.execute(stats_query, (nconst,))
        contributor_info = cursor.fetchone()

        if not contributor_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contributor not found"
            )

        cursor.execute(popular_movies_query, (nconst,))
        popular_movies = cursor.fetchall()

        contributor_info["popular_works"] = [
            movie["primary_title"] for movie in popular_movies
        ]
        redis_client.set(cache_key, json.dumps(contributor_info), ex=3600)

        return contributor_info

    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contributor information"
        )