from mysql.connector import MySQLConnection

def get_contributor_info_service(
    db: MySQLConnection,
    contributor: str
):
    cursor = db.cursor(dictionary=True)

    stats_query = """
    SELECT
        c.primaryName as name,
        c.birthYear as birth_year,
        c.deathYear as death_year,
        COUNT(DISTINCT m.tconst) AS num_movies,
        SUM(m.numVotes) as total_votes,
        AVG(m.averageRating) as avg_rating,
        AVG(m.numVotes) as avg_votes,
        STDDEV(m.averageRating) as rating_std
    FROM movies m
    JOIN movie_contributors mc ON mc.tconst = m.tconst
    JOIN contributors c ON c.nconst = mc.nconst
    WHERE c.primaryName = %s
    GROUP BY c.nconst
    """

    cursor.execute(stats_query, (contributor,))
    actor_info = cursor.fetchone()

    popular_movies_query = """
    SELECT m.primaryTitle
    FROM movies m
    JOIN popular_works pw ON pw.tconst = m.tconst
    JOIN contributors c ON c.nconst = pw.nconst
    WHERE c.primaryName = %s
    """

    cursor.execute(popular_movies_query, (contributor,))
    popular_movies = cursor.fetchall()

    actor_info["popular_works"] = [movie["primaryTitle"] for movie in popular_movies]

    return actor_info
