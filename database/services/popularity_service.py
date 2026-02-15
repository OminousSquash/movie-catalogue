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

    popularity_query = """
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
    cursor.execute(popularity_query)
    return cursor.fetchall()

def get_popular_contributors_by_genre_service(
    db: MySQLConnection,
    genre: str
):
    cursor = db.cursor(dictionary = True)
    popular_contributors_query = """
    SELECT 
        c.primaryName,
        COUNT(DISTINCT m.tconst) AS thriller_movies,
        SUM(m.numVotes) AS total_votes 
    FROM contributors c
    JOIN movie_contributors mc ON mc.nconst = c.nconst
    JOIN movies m ON m.tconst = mc.tconst
    JOIN movie_genres mg ON mg.tconst = m.tconst
    JOIN genres g ON g.genreID = mg.genreID
    WHERE g.genre = %s
    GROUP BY c.nconst, c.primaryName
    ORDER BY total_votes DESC
    LIMIT 5;
    """
    
    cursor.execute(popular_contributors_query, (genre,))
    popular_contributors = cursor.fetchall()

    return popular_contributors