from fastapi import APIRouter, Query, Depends, FastAPI
from backend.DTOs.movie_filter_dto import MovieFilterDTO
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from database.services.movies_service import get_movies_service
from database.database import get_db

router = APIRouter(prefix="/contributor", tags=["contributor"])

@router.get("/{name}")
def get_contributor_info(
    name:str,
    db = Depends(get_db)
):
    return

