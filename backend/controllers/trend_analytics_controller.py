from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.trend_analysis_service import get_trend_analytics_service, get_contributor_trends_service, get_genre_popularity_over_time_service
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO
from database.database import get_db
 
router = APIRouter(prefix="/trend_analysis", tags=["trend analysis"])

@router.get("/")
def get_trend_analysis(
    db = Depends(get_db)
):
    return get_trend_analytics_service(db = db)

@router.post("/contributors")
def get_contributor_analysis(
    genre_contributor_dto: GenreContributorTrendAnalysisDTO,
    db = Depends(get_db)
):
    return get_contributor_trends_service(
        db=db,
        genre_contributor_dto=genre_contributor_dto
    )

@router.get("/genre_popularity_over_time")
def genre_popularity_over_time(
    start_year: int | None = Query(None, description="Filter from this year"),
    end_year: int | None = Query(None, description="Filter up to this year"),
    genres: list[str] | None = Query(None, description="List of genres to include"),
    db = Depends(get_db)
):
    return get_genre_popularity_over_time_service(db, start_year, end_year, genres)