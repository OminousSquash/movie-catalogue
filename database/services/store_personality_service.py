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
        recommended_genres = get_recommended_genres_service(user_traits=user_traits, db=db)
        cursor.execute(
            """
            UPDATE app_users 
            SET 
                openness = %s,
                agreeableness = %s,
                emotional_stability = %s,
                conscientiousness = %s,
                extraversion = %s,
                recommended_genres = %s
            WHERE app_user_id = %s
            """,
            (
                store_personality_dto.openness,
                store_personality_dto.agreeableness,
                store_personality_dto.emotional_stability,
                store_personality_dto.conscientiousness,
                store_personality_dto.extraversion,
                ",".join(recommended_genres),
                current_user,
            )
        )
        db.commit()
        return {"message": "Personality saved successfully"}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save personality"
        )