from mysql.connector import MySQLConnection
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from backend.DTOs.movie_filter_dto import MovieFilterDTO
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

    query = """
        SELECT 
            g.genre,
            COUNT(*) AS num_movies,
            AVG(m.averageRating) AS avg_rating,
            AVG(m.numVotes) AS avg_num_votes
        FROM movies m
        JOIN movie_genres mg ON m.tconst = mg.tconst
        JOIN genres g ON g.genreID = mg.genreID
        WHERE g.genre != 'N'
        GROUP BY g.genre
    """
    cursor.execute(query)
    return cursor.fetchall()
    