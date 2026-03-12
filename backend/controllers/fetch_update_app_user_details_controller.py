from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.store_personality_dto import StorePersonalityDTO
from database.services.fetch_app_user_detail_service import fetch_app_user_detail_service
from backend.security.dependencies import get_current_user

router = APIRouter(prefix="/account", tags=["account handling"])

@router.post("/details")
def fetch_details(
    personality_dto: StorePersonalityDTO,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    fetch_app_user_detail_service(current_user=current_user, db=db)
    update
