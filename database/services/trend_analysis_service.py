from mysql.connector import MySQLConnection
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO

def get_trend_analytics_service(
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    trend_analytics_query = """
    SELECT  
        STDDEV(m.averageRating) AS std_rating,
        FLOOR(m.startYear / 10) * 10 AS decade,
        g.genre,
        AVG(m.averageRating) AS avg_rating,
        SUM(m.numVotes) as total_votes
    FROM movies m
    JOIN movie_genres mg ON m.tconst = mg.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY g.genre, decade
    ORDER BY decade DESC, total_votes DESC
    """
    cursor.execute(trend_analytics_query)
    return cursor.fetchall()

def get_contributor_trends_service(
    db: MySQLConnection,
    genre_contributor_dto: GenreContributorTrendAnalysisDTO
):
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT
            c.primaryName AS name,
            COUNT(DISTINCT m.tconst) AS movies_cnt,
            SUM(m.numVotes) AS total_votes
        FROM contributors c
        JOIN movie_contributors mc ON mc.nconst = c.nconst
        JOIN movies m ON m.tconst = mc.tconst
    """

    conditions = []
    params = []

    if genre_contributor_dto.genres:
        genres = genre_contributor_dto.genres
        placeholders = ",".join(["%s"] * len(genres))

        conditions.append(f"""
            EXISTS (
                SELECT 1
                FROM movie_genres mg
                JOIN genres g ON g.genreID = mg.genreID
                WHERE mg.tconst = m.tconst
                AND g.genre IN ({placeholders})
            )
        """)
        params.extend(genres)

    if genre_contributor_dto.last_decade:
        conditions.append("""
            m.startYear >= (
                SELECT FLOOR(MAX(startYear) / 10) * 10 FROM movies
            )
        """)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += """
        GROUP BY c.primaryName
        ORDER BY total_votes DESC
        LIMIT 5
    """

    cursor.execute(query, params)
    return cursor.fetchall()
