from mysql.connector import MySQLConnection, Error
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO
from fastapi import HTTPException, status

def get_trend_analytics_service(
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
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
        return cursor.fetchall()
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

def get_contributor_trends_service(
    db: MySQLConnection,
    genre_contributor_dto: GenreContributorTrendAnalysisDTO
):
    try:
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
        return cursor.fetchall()
    except HTTPException:
        raise
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")
