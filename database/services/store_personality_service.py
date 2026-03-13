from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.store_personality_dto import StorePersonalityDTO
from database.services.genre_recommend_service import get_recommended_genres_service

def store_personality_service(
    store_personality_dto: StorePersonalityDTO,
    db: MySQLConnection,
    current_user: int
):
    try:
        cursor = db.cursor(dictionary=True)
        user_traits = {
            "openness": store_personality_dto.openness,
            "agreeableness": store_personality_dto.agreeableness,
            "emotional_stability": store_personality_dto.emotional_stability,
            "conscientiousness": store_personality_dto.conscientiousness,
            "extraversion": store_personality_dto.extraversion,
        }
        recommended_genre_ids = get_recommended_genres_service(user_traits=user_traits, db=db)

        cursor.execute(
            """
            UPDATE app_users 
            SET 
                openness = %s,
                agreeableness = %s,
                emotional_stability = %s,
                conscientiousness = %s,
                extraversion = %s
            WHERE app_user_id = %s
            """,
            (
                store_personality_dto.openness,
                store_personality_dto.agreeableness,
                store_personality_dto.emotional_stability,
                store_personality_dto.conscientiousness,
                store_personality_dto.extraversion,
                current_user,
            )
        )

        cursor.execute(
            "DELETE FROM app_user_recommended_genres WHERE app_user_id = %s",
            (current_user,)
        )

        for genre_id in recommended_genre_ids:
            cursor.execute(
                "INSERT INTO app_user_recommended_genres (app_user_id, genre_id) VALUES (%s, %s)",
                (current_user, genre_id)
            )

        db.commit()
        return {"message": "Personality saved successfully"}

    except HTTPException:
        raise
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save personality: {str(e)}"
        )