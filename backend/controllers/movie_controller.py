from fastapi import APIRouter, Query, Depends, FastAPI
from backend.DTOs.movie_filter_dto import MovieFilterDTO
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from database.services.movies_service import get_movies_service
from database.database import get_db

router = APIRouter(prefix="/movies", tags=["movies"])

@router.post("/")
def get_movies(
    filters: MovieFilterDTO = Depends(),
    contributors: MovieContributorFilterDTO = Depends(),
    page: int = Query(1, ge=1),
    db = Depends(get_db)
):
    return get_movies_service(
        db=db, 
        movie_filters=filters,
        contributor_filters=contributors,
        page=page
    )

@router.get('/recent')
def get_recent_movies():
    return []
