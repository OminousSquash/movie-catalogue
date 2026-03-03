from mysql.connector import MySQLConnection

def get_contributor_info_service(
    db: MySQLConnection,
    contributor: str
):
    cursor = db.cursor(dictionary=True)

    stats_query = """
    SELECT
        c.primary_name as name,
        c.birth_year as birth_year,
        c.death_year as death_year,
        COUNT(DISTINCT m.tconst) AS num_movies,
        SUM(m.num_votes) as total_votes,
        AVG(m.average_rating) as avg_rating,
        AVG(m.num_votes) as avg_votes,
        STDDEV(m.average_rating) as rating_std
    FROM movies m
    JOIN movie_contributors mc ON mc.tconst = m.tconst
    JOIN contributors c ON c.nconst = mc.nconst
    WHERE c.primary_name = %s
    GROUP BY c.nconst
    """

    cursor.execute(stats_query, (contributor,))
    actor_info = cursor.fetchone()

    popular_movies_query = """
    SELECT m.primary_title
    FROM movies m
    JOIN popular_works pw ON pw.tconst = m.tconst
    JOIN contributors c ON c.nconst = pw.nconst
    WHERE c.primary_name = %s
    """

    cursor.execute(popular_movies_query, (contributor,))
    popular_movies = cursor.fetchall()

    actor_info["popular_works"] = [movie["primary_title"] for movie in popular_movies]

    return actor_info
