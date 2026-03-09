from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status

def get_contributor_info_service(
    db: MySQLConnection,
    contributor: str
):
    cursor = db.cursor(dictionary=True)

    contributor_count_query = """
    SELECT COUNT(DISTINCT nconst) AS contributor_count
    FROM contributors
    WHERE primary_name = %s
    """

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

    popular_movies_query = """
    SELECT m.primary_title
    FROM movies m
    JOIN popular_works pw ON pw.tconst = m.tconst
    JOIN contributors c ON c.nconst = pw.nconst
    WHERE c.primary_name = %s
    """

    try:
        cursor.execute(contributor_count_query, (contributor,))
        contributor_count = cursor.fetchone()["contributor_count"]

        if contributor_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contributor not found"
            )

        if contributor_count > 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Multiple contributors found for the provided name"
            )

        cursor.execute(stats_query, (contributor,))
        contributor_info = cursor.fetchone()

        if not contributor_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contributor not found"
            )

        cursor.execute(popular_movies_query, (contributor,))
        popular_movies = cursor.fetchall()
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contributor information"
        )

    actor_info["popular_works"] = [movie["primary_title"] for movie in popular_movies]

    return actor_info
