from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.update_app_user_dto import UpdateAppUserDTO

def update_app_user_detail_service(
    update_dto: UpdateAppUserDTO,
    current_user: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            UPDATE app_users
            SET
                app_username = %s,
                openness = %s,
                agreeableness = %s,
                emotional_stability = %s,
                conscientiousness = %s,
                extraversion = %s
            WHERE app_user_id = %s
            """,
            (
                update_dto.app_username,
                update_dto.openness,
                update_dto.agreeableness,
                update_dto.emotional_stability,
                update_dto.conscientiousness,
                update_dto.extraversion,
                current_user,
            )
        )
        db.commit()

        return {"message": "User details updated successfully"}

    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user details"
        )