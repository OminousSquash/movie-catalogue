from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.personality_correlation_dto import PersonalityCorrelationDTO
from backend.DTOs.genre_profiles_dto import GenreProfilesDTO
from database.services.personality_traits_service import (
    get_personality_genre_correlations_service, 
    get_genre_personality_profiles_service
)

router = APIRouter(prefix="/personality_traits", tags=["personality traits"])

@router.post("/correlation")
def get_correlation_statistics(
    personality_corr_dto: PersonalityCorrelationDTO,
    db = Depends(get_db)
):
    return get_personality_genre_correlations_service(
        personality_corr_dto=personality_corr_dto, 
        db=db
    )

@router.post("/genre_profiles")
def get_genre_personality_profiles(
    genre_profiles_dto: GenreProfilesDTO,
    db = Depends(get_db)
):
    return get_genre_personality_profiles_service(
        genre_profiles_dto=genre_profiles_dto,
        db=db
    )
