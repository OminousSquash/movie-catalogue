from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from database.services.movies_service import _get_poster_index, POSTER_BASE_URL

def fetch_recommended_movies_service(
    current_user: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT genre_id FROM app_user_recommended_genres WHERE app_user_id = %s",
            (current_user,)
        )
        genre_rows = cursor.fetchall()

        if not genre_rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No recommended genres found for this user"
            )

        genre_ids = [row["genre_id"] for row in genre_rows]

        results = {}
        for genre_id in genre_ids:
            cursor.execute(
                """
                SELECT
                    m.tconst,
                    m.primary_title,
                    m.start_year,
                    m.average_rating,
                    m.num_votes,
                    g.genre
                FROM movies m
                JOIN movie_genres mg ON mg.tconst = m.tconst
                JOIN genres g ON g.genre_id = mg.genre_id
                WHERE mg.genre_id = %s
                AND m.average_rating IS NOT NULL
                ORDER BY m.average_rating DESC
                LIMIT 10
                """,
                (genre_id,)
            )
            movies = cursor.fetchall()
            poster_index = _get_poster_index()
            for row in movies:
                poster_name = poster_index.get(row.get("tconst", ""))
                row["poster"] = f"{POSTER_BASE_URL}/{poster_name}" if poster_name else None
            if movies:
                genre_name = movies[0]["genre"]
                results[genre_name] = movies

        return results

    except HTTPException:
        raise
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recommended movies: {str(e)}"
        )