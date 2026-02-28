from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.create_user_list_dto import CreateUserListDTO

router = APIRouter("/user_list", tags=["user lists"])

@router.get("{list_id}")
def get_user_list():
    return

@router.post("/")
def create_user_list(
    create_user_list_dto: CreateUserListDTO = Depends(),
    db = Depends(get_db)
):
    return

@router.put("{list_id}")
def update_user_list():
    return

@router.delete("{list_id}")
def delete_user_list():
    return

