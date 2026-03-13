from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from database.services.personality_traits_service import get_genre_personality_profiles_service, traits

def get_recommended_genres_service(
    user_traits: dict,
    db: MySQLConnection
):
    try:
        query = """
            SELECT
                g.genre,
                SQRT(
                    POW(AVG(p.openness) - %s, 2) +
                    POW(AVG(p.agreeableness) - %s, 2) +
                    POW(AVG(p.emotional_stability) - %s, 2) +
                    POW(AVG(p.conscientiousness) - %s, 2) +
                    POW(AVG(p.extraversion) - %s, 2)
                ) AS distance
            FROM dataset_user_ratings ur
            JOIN movie_genres mg ON mg.tconst = ur.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            JOIN dataset_user_personalities p ON p.dataset_user_id = ur.dataset_user_id
            WHERE LENGTH(TRIM(g.genre)) > 1
            GROUP BY g.genre_id, g.genre
            HAVING COUNT(DISTINCT p.dataset_user_id) >= 50
            ORDER BY distance ASC
            LIMIT 3
        """

        params = [
            user_traits["openness"],
            user_traits["agreeableness"],
            user_traits["emotional_stability"],
            user_traits["conscientiousness"],
            user_traits["extraversion"],
        ]

        cursor = db.cursor(dictionary=True)
        cursor.execute(query, params)
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No genre recommendations found"
            )

        return [row["genre"] for row in rows]

    except HTTPException:
        raise
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate recommended genres: {str(e)}"
        )