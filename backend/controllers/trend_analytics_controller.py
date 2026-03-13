from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.trend_analysis_service import get_genre_trend_service, get_contributor_trends_service
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO
from database.database import get_db
 
router = APIRouter(prefix="/trend_analysis", tags=["trend analysis"])

@router.get("/genres")
def get_genre_trend_analysis(
    db = Depends(get_db)
):
    return get_genre_trend_service(db = db)

@router.post("/contributors")
def get_contributor_trend_analysis(
    genre_contributor_dto: GenreContributorTrendAnalysisDTO,
    db = Depends(get_db)
):
    return get_contributor_trends_service(
        db=db,
        genre_contributor_dto=genre_contributor_dto
    )
