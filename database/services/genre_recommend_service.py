from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.update_app_user_dto import UpdateAppUserDTO
from backend.DTOs.genre_profiles_dto import GenreProfilesDTO
from database.services.personality_traits_service import get_genre_personality_profiles_service, traits

def get_recommended_genres_service(
    update_dto: UpdateAppUserDTO,
    db: MySQLConnection
):
    try:
        genre_profile_dto = GenreProfilesDTO(minimum_no_users=50, genre=None)
        profiles = get_genre_personality_profiles_service(genre_profile_dto, db)

        user_traits = {
            "openness": update_dto.openness,
            "agreeableness": update_dto.agreeableness,
            "emotional_stability": update_dto.emotional_stability,
            "conscientiousness": update_dto.conscientiousness,
            "extraversion": update_dto.extraversion,
        }

        scored = []
        for profile in profiles:
            distance = sum(
                (user_traits[t] - profile["traits"][t]["avg"]) ** 2
                for t in traits
            )
            scored.append((profile["genre"], distance))
        scored.sort(key=lambda x: x[1])

        return [genre for genre, _ in scored[:3]]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate recommended genres: {str(e)}"
        )