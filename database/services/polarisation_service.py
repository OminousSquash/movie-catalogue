from mysql.connector import MySQLConnection

def polarisation_metrics_service(
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    stats_query = """
    SELECT
        g.genre,
        STDDEV(m.averageRating) as std_rating,
        100.0 * SUM(m.averageRating >= 8.0) / COUNT(*) AS high_percent,
        100.0 * SUM(m.averageRating <= 5.0) / COUNT(*) AS low_percent,
        STDDEV(m.averageRating) *
            (
                1 + (
                        (
                            100.0 * SUM(m.averageRating >= 8.0) / COUNT(*) +
                            100.0 * SUM(m.averageRating <= 5.0) / COUNT(*)
                        ) / 100.0
                    )
            ) AS polarisation_score
    FROM movies m
    JOIN movie_genres mg ON mg.tconst = m.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY g.genreID, g.genre
    """
    cursor.execute(stats_query)
    return cursor.fetchall()