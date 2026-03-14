from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.utils.redis_client import redis_client
from backend.utils.json_utils import make_json_safe
import json

PAGE_SIZE = 50


def get_popularity_report_service(
    db: MySQLConnection,
):
    try:
        cache_key = "popularity_report"
        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        cursor = db.cursor(dictionary = True)
        popularity_query = """
            SELECT 
                g.genre,
                COUNT(*) AS num_movies,
                AVG(m.average_rating) AS avg_rating,
                AVG(m.num_votes) AS avg_num_votes
            FROM movies m
            JOIN movie_genres mg ON m.tconst = mg.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            WHERE g.genre != 'N'
            GROUP BY g.genre
        """
        cursor.execute(popularity_query)
        result = cursor.fetchall()

        redis_result = make_json_safe(result)
        redis_client.set(cache_key, json.dumps(redis_result), ex=3600)
        return result

    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")
