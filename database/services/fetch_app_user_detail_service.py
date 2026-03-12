from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status

def fetch_app_user_detail_service(
    current_user: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT app_user_id, app_username, openness, agreeableness, emotional_stability, conscientiousness, extraversion FROM app_users WHERE app_user_id = %s",
            (current_user,)
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user details"
        )