from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.store_personality_dto import StorePersonalityDTO
from database.services.store_personality_service import store_personality_service
from backend.security.dependencies import get_current_user

router = APIRouter(prefix="/account", tags=["account handling"])

@router.post("/personality")
def save_personality(
    personality_dto: StorePersonalityDTO,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return store_personality_service(personality_dto=personality_dto, db=db, current_user=current_user)