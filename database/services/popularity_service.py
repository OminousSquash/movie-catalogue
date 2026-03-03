from mysql.connector import MySQLConnection
from typing import List
import math

PAGE_SIZE = 50


def get_popularity_report_service(
    db: MySQLConnection,
):
    cursor = db.cursor(dictionary = True)

    get_genres_query = "SELECT DISTINCT * FROM genres;"
    cursor.execute(get_genres_query)
    genre_list = cursor.fetchall()
    genre_list = [g for g in genre_list if g['genre'] != 'N']

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
