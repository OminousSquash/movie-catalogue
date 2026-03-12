from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.store_personality_dto import StorePersonalityDTO

def store_personality_service(
    personality_dto: StorePersonalityDTO,
    db: MySQLConnection,
    current_user: int
):
    try:
        cursor = db.cursor(dictionary=True)

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
                personality_dto.openness,
                personality_dto.agreeableness,
                personality_dto.emotional_stability,
                personality_dto.conscientiousness,
                personality_dto.extraversion,
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