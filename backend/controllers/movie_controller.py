from fastapi import APIRouter, Query, Depends
from backend.DTOs.movie_search_filter_dto import MovieSearchFilterDTO
from database.services.movies_service import (
    get_movies_service,
    get_oscar_movies_service,
    get_movie_oscars_service,
    get_predicted_ratings_service,
    get_predicted_rating_by_tconst_service
)
from database.database import get_db

router = APIRouter(prefix="/movies", tags=["movies"])

@router.post("/")
def get_movies(
    filters: MovieSearchFilterDTO,
    page: int = Query(1, ge=1),
    db = Depends(get_db)
):
    return get_movies_service(
        db=db, 
        movie_filters=filters,
        contributor_filters=filters,
        page=page
    )

@router.get('/recent')
def get_recent_movies(
    db = Depends(get_db)
):
    return get_predicted_ratings_service(db=db)

@router.get("/oscar_movies")
def get_oscar_movies(
    db = Depends(get_db)
):
    return get_oscar_movies_service(db=db)


@router.get("/{tconst}/oscars")
def get_movie_oscars(
    tconst: str,
    db = Depends(get_db)
):
    return get_movie_oscars_service(db=db, tconst=tconst)
