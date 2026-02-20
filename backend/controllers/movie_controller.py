# movie_controller.py

from fastapi import APIRouter, Query, Depends
from database.database import get_db
from backend.utils.imdb_scraper import imdbScraper
from backend.DTOs.movie_filter_dto import MovieFilterDTO
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from database.services.movies_service import (
    get_movies_service,
    get_recent_movies_service,
    get_genres_service,
)

router = APIRouter(prefix="/movies", tags=["movies"])

_scraper = imdbScraper()


@router.get("/genres")
def get_genres(db=Depends(get_db)):
    return get_genres_service(db=db)


@router.get("/recent")
def get_recent_movies(
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db)
):
    return get_recent_movies_service(db=db, limit=limit)


@router.get("/")
def get_movies(
    # CHANGED: replaced the long list of individual Query() parameters with
    # two DTO objects injected via Depends(). FastAPI calls the dataclass
    # constructors automatically, parsing query params into each field.
    # This keeps the controller thin — it just passes the DTOs to the service.
    filters: MovieFilterDTO = Depends(),
    contributor_filters: MovieContributorFilterDTO = Depends(),
    page: int = Query(1, ge=1),
    db=Depends(get_db)
):
    # Unpack both DTOs when calling the service so the service signature
    # doesn't need to change — it still receives individual named arguments.
    return get_movies_service(
        db=db,
        title=filters.title,
        start_year=filters.start_year,
        end_year=filters.end_year,
        min_rating=filters.min_rating,
        max_rating=filters.max_rating,
        min_runtime=filters.min_runtime,
        max_runtime=filters.max_runtime,
        min_votes=filters.min_votes,
        max_votes=filters.max_votes,
        genres=filters.genres,
        tags=filters.tags,
        actors=contributor_filters.actors,
        directors=contributor_filters.directors,
        writers=contributor_filters.writers,
        page=page
    )


# IMPORTANT: static routes (/genres, /recent) must stay above /{tconst}/poster
# and /{tconst}/awards. FastAPI matches routes top to bottom — if the parameterised
# routes were first, "genres" and "recent" would be captured as tconst values.

@router.get("/{tconst}/poster")
def get_movie_poster(tconst: str):
    poster_url = _scraper.get_poster_path(tconst)
    return {"poster_url": poster_url}


@router.get("/{tconst}/awards")
def get_movie_awards(tconst: str):
    awards = _scraper.get_awards(tconst)
    return {"awards": awards or []}