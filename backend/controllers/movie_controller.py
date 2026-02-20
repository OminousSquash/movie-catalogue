# movie_controller.py

from fastapi import APIRouter, Query, Depends
from typing import Optional, List
from database.services.movies_service import (
    get_movies_service,
    get_recent_movies_service,
    get_genres_service,
    get_distinct_roles_service  # ADDED: debug helper to inspect actual role values in DB
)
from database.database import get_db
from backend.utils.imdb_scraper import imdbScraper

router = APIRouter(prefix="/movies", tags=["movies"])

# Single shared scraper instance — cache persists across all requests
_scraper = imdbScraper()

# IMPORTANT — ROUTE ORDER MATTERS IN FASTAPI:
# Static paths (/genres, /recent) MUST be defined before parameterised paths
# (/{tconst}/poster) otherwise FastAPI matches "genres" and "recent" as tconst
# values and routes them to the wrong handler.


@router.get("/genres")
def get_genres(db=Depends(get_db)):
    """
    Returns all genre names from the database.
    Frontend uses this to build the checkbox list — guarantees names
    match exactly what is stored in the genres table.
    """
    return get_genres_service(db=db)


@router.get("/debug/roles")
def get_roles(db=Depends(get_db)):
    """
    DEBUG ENDPOINT — call this in your browser at http://localhost:8000/movies/debug/roles
    to see exactly what role values are stored in movie_contributors.
    This tells us whether LIKE '%actor%' is actually matching anything.
    Remove this endpoint before final submission.
    """
    return get_distinct_roles_service(db=db)


@router.get("/recent")
def get_recent_movies(
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db)
):
    return get_recent_movies_service(db=db, limit=limit)


@router.get("/")
def get_movies(
    title: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_rating: Optional[float] = Query(None),
    min_runtime: Optional[int] = Query(None),
    max_runtime: Optional[int] = Query(None),
    min_votes: Optional[int] = Query(None),
    max_votes: Optional[int] = Query(None),
    genres: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    actors: Optional[List[str]] = Query(None),
    directors: Optional[List[str]] = Query(None),
    writers: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    db=Depends(get_db)
):
    return get_movies_service(
        db=db,
        title=title,
        start_year=start_year,
        end_year=end_year,
        min_rating=min_rating,
        max_rating=max_rating,
        min_runtime=min_runtime,
        max_runtime=max_runtime,
        min_votes=min_votes,
        max_votes=max_votes,
        genres=genres,
        tags=tags,
        actors=actors,
        directors=directors,
        writers=writers,
        page=page
    )


# IMPORTANT: /{tconst}/poster and /{tconst}/awards are defined LAST
# so that /genres, /recent, /debug/roles are matched first as static paths.

@router.get("/{tconst}/poster")
def get_movie_poster(tconst: str):
    poster_url = _scraper.get_poster_path(tconst)
    return {"poster_url": poster_url}


@router.get("/{tconst}/awards")
def get_movie_awards(tconst: str):
    awards = _scraper.get_awards(tconst)
    return {"awards": awards or []}

# from fastapi import APIRouter, Query, Depends, FastAPI
# from backend.DTOs.movie_filter_dto import MovieFilterDTO
# from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
# from database.services.movies_service import get_movies_service
# from database.database import get_db

# router = APIRouter(prefix="/movies", tags=["movies"])

# @router.post("/")
# def get_movies(
#     filters: MovieFilterDTO = Depends(),
#     contributors: MovieContributorFilterDTO = Depends(),
#     page: int = Query(1, ge=1),
#     db = Depends(get_db)
# ):
#     return get_movies_service(
#         db=db, 
#         movie_filters=filters,
#         contributor_filters=contributors,
#         page=page
#     )

# @router.get('/recent')
# def get_recent_movies():
#     return []

