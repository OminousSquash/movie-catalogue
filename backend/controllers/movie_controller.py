from fastapi import APIRouter, Query, Depends, FastAPI
from DTOs.movie_filter_dto import MovieFilterDTO
from DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("/")
def get_movies(
    filters: MovieFilterDTO = Depends(),
    contributors: MovieContributorFilterDTO = Depends()
):
    return

@router.get('/recent')
def get_recent_movies():
    return
