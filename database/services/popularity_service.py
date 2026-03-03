from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status

PAGE_SIZE = 50


def get_popularity_report_service(
    db: MySQLConnection,
):
    try:
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
        return cursor.fetchall()
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")
