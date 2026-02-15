from mysql.connector import MySQLConnection

PAGE_SIZE = 50

def get_contributor_info(
    db: MySQLConnection,
    contributor: str
):
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT
        c.primaryName as name,
        c.birthYear as birth_year,
        c.deathYear as death_year,
        COUNT(*) AS num_movies,
        SUM(m.numVotes) as total_votes,
        AVG(m.averageRating) as avg_rating,
        AVG(m.numVotes) as avg_votes,
        STDDEV(m.averageRating) as rating_std
    FROM movies m
    JOIN movie_contributors mc on mc.tconst = m.tconst
    JOIN contributors c on c.nconst = mc.nconst
    WHERE c.primaryName = %s
    """
    cursor.execute(query)
    actor_info = cursor.fetchall()
    


