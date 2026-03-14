from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.utils.redis_client import redis_client
import json

def polarisation_metrics_service(
    db: MySQLConnection
):
    try:
        
        cache_key = "polarisation_metrics"

        cached_result = redis_client.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        
        cursor = db.cursor(dictionary = True)
        stats_query = """
        WITH ranked AS (
            SELECT
                g.genre_id,
                g.genre,
                m.average_rating,
                PERCENT_RANK() OVER (
                    PARTITION BY g.genre_id
                    ORDER BY m.average_rating
                ) AS pct_rank
            FROM movies m
            JOIN movie_genres mg ON mg.tconst = m.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            WHERE m.average_rating IS NOT NULL
        ),
        iqr AS (
            SELECT
                genre_id,
                MAX(CASE WHEN pct_rank <= 0.25 THEN average_rating END) AS q1,
                MAX(CASE WHEN pct_rank <= 0.75 THEN average_rating END) AS q3
            FROM ranked
            GROUP BY genre_id
        )
        SELECT
            g.genre,
            STDDEV(m.average_rating) AS std_rating,
            100.0 * SUM(m.average_rating >= 8.0) / COUNT(*) AS high_percent,
            100.0 * SUM(m.average_rating <= 5.0) / COUNT(*) AS low_percent,
            STDDEV(m.average_rating) *
                (
                    1 + (
                            (
                                100.0 * SUM(m.average_rating >= 8.0) / COUNT(*) +
                                100.0 * SUM(m.average_rating <= 5.0) / COUNT(*)
                            ) / 100.0
                        )
                ) AS polarisation_score,
            ROUND(iq.q3 - iq.q1, 4) AS iqr
        FROM movies m
        JOIN movie_genres mg ON mg.tconst = m.tconst
        JOIN genres g ON g.genre_id = mg.genre_id
        JOIN iqr iq ON iq.genre_id = g.genre_id
        WHERE m.average_rating IS NOT NULL
        GROUP BY g.genre_id, g.genre, iq.q1, iq.q3
        """
        cursor.execute(stats_query)
        result = cursor.fetchall()
        redis_client.set(cache_key, json.dumps(result), ex=3600)
        return result

    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")