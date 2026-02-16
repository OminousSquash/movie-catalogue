from mysql.connector import MySQLConnection

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