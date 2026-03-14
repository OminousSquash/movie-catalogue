from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.signup_dto import SignupDTO
from backend.DTOs.login_dto import LoginDTO
from database.services.login_signup_service import login_service, signup_service
from backend.security.dependencies import security
from backend.security.auth_utils import block_token, is_token_blocked, SECRET_KEY, ACCESS_TOKEN_EXPIRE_HOURS, ALGORITHM
import time
from jose import jwt, JWTError
from fastapi import HTTPException

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

@router.post("/logout")
def logout(
    token = Depends(security)
):
    raw_token = token.credentials
    if not is_token_blocked(raw_token):
        try:
            payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
            remaining = int(payload["exp"] - time.time())
            if remaining > 0:
                block_token(raw_token, remaining)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": "Logged Out"}
