from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.polarisation_service import polarisation_metrics_service
from database.database import get_db

router = APIRouter(prefix="/polarisation", tags=["polarisation"])

@router.get("/")
def get_polarisation_data(
    db = Depends(get_db)
):
    return polarisation_metrics_service(db=db)