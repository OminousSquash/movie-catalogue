from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from database.services.app_user_details_service import update_app_user_detail_service, store_personality_service, fetch_app_user_detail_service
from backend.security.dependencies import get_current_user
from backend.DTOs.update_app_user_dto import UpdateAppUserDTO
from backend.DTOs.store_personality_dto import StorePersonalityDTO

router = APIRouter(prefix="/account", tags=["account handling"])

@router.get("/details")
def fetch_details(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return fetch_app_user_detail_service(current_user=current_user, db=db)

@router.put("/update")
def update_details(
    update_dto: UpdateAppUserDTO,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return update_app_user_detail_service(update_dto=update_dto, current_user=current_user, db=db)

@router.post("/store_personality")
def save_personality(
    store_personality_dto: StorePersonalityDTO,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return store_personality_service(store_personality_dto=store_personality_dto, db=db, current_user=current_user)