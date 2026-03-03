from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status

def polarisation_metrics_service(
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
        stats_query = """
        SELECT
            g.genre,
            STDDEV(m.average_rating) as std_rating,
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
                ) AS polarisation_score
        FROM movies m
        JOIN movie_genres mg ON mg.tconst = m.tconst
        JOIN genres g ON g.genre_id = mg.genre_id
        GROUP BY g.genre_id, g.genre
        """
        cursor.execute(stats_query)
        return cursor.fetchall()
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")