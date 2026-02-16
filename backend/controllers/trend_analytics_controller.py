from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.trend_analysis_service import get_trend_analytics_service
from database.database import get_db
 
router = APIRouter(prefix="/trend_analysis", tags=["trend analysis"])

@router.get("/")
def get_trend_analysis(
    db = Depends(get_db)
):
    return get_trend_analytics_service(db = db)