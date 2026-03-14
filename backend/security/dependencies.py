from fastapi import Depends, HTTPException, status 
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from backend.utils.redis_client import redis_client
from backend.security.auth_utils import build_key, is_token_blocked
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS"))


security = HTTPBearer()

def get_current_user(token=Depends(security)):
    try:
        if is_token_blocked(token=token.credentials):
            raise HTTPException(status_code=401, detail="Token has been revoked")

        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        app_user_id = payload.get("sub")

        if app_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return int(app_user_id)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
