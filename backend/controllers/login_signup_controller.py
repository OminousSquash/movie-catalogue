from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.signup_dto import SignupDTO
from backend.DTOs.login_dto import LoginDTO
from database.services.login_signup_service import login_service, signup_service

router = APIRouter(prefix="/account", tags=["account handling"])

@router.post("/login")
def login(
    login_dto: LoginDTO,
    db = Depends(get_db)
):
    return login_service(login_dto=login_dto, db=db)

@router.post("/signup")
def signup(
    signup_dto: SignupDTO,
    db = Depends(get_db)
):
    return signup_service(signup_dto=signup_dto, db=db)
