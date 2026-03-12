from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from database.services.fetch_app_user_detail_service import fetch_app_user_detail_service
# from database.services.update_app_user_detail_service import update_app_user_detail_service
from backend.security.dependencies import get_current_user

router = APIRouter(prefix="/account", tags=["account handling"])

@router.get("/details")
def fetch_details(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return fetch_app_user_detail_service(current_user=current_user, db=db)

# @router.put("/update")
# def update_details(
#     personality_dto: StorePersonalityDTO,
#     db = Depends(get_db),
#     current_user = Depends(get_current_user)
# ):
    # return update_app_user_detail_service(personality_dto=personality_dto, current_user=current_user, db=db)