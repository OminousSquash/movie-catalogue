from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.update_app_user_dto import UpdateAppUserDTO
from database.services.genre_recommend_service import get_recommended_genres_service

def update_app_user_detail_service(
    update_dto: UpdateAppUserDTO,
    current_user: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)
        user_traits = {
            "openness": update_dto.openness,
            "agreeableness": update_dto.agreeableness,
            "emotional_stability": update_dto.emotional_stability,
            "conscientiousness": update_dto.conscientiousness,
            "extraversion": update_dto.extraversion,
        }
        recommended_genres = get_recommended_genres_service(user_traits=user_traits, db=db)
        cursor.execute(
            """
            UPDATE app_users
            SET
                app_username = %s,
                openness = %s,
                agreeableness = %s,
                emotional_stability = %s,
                conscientiousness = %s,
                extraversion = %s,
                recommended_genres = %s
            WHERE app_user_id = %s
            """,
            (
                update_dto.app_username,
                update_dto.openness,
                update_dto.agreeableness,
                update_dto.emotional_stability,
                update_dto.conscientiousness,
                update_dto.extraversion,
                ",".join(recommended_genres),
                current_user,
            )
        )
        db.commit()

        return {
            "message": "User details updated successfully",
        }

    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user details"
        )