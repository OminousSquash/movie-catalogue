from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.update_app_user_dto import UpdateAppUserDTO
from backend.DTOs.store_personality_dto import StorePersonalityDTO
from database.services.genre_recommend_service import get_recommended_genres_service

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
        recommended_genre_ids = get_recommended_genres_service(user_traits=user_traits, db=db)

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

        return {
            "message": "User details updated successfully",
        }

    except HTTPException:
        raise
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user details: {str(e)}"
        )
    
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