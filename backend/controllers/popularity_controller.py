from fastapi import APIRouter, Query, Depends, FastAPI
from backend.DTOs.movie_filter_dto import MovieFilterDTO
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from database.services.popularity_service import get_popularity_report_service, get_popular_contributors_by_genre_service
from database.database import get_db

router = APIRouter(prefix="/popularity", tags=["popularity"])

@router.get("/genre_popularity_data")
def get_genre_popularity_data(
    db = Depends(get_db)
):
    return get_popularity_report_service(db=db)

@router.get("/popular_contributors/{genre}")
def get_popular_contributors(
    genre: str,
    db = Depends(get_db),
):
    return get_popular_contributors_by_genre_service(db=db, genre=genre)
