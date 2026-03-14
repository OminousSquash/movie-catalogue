from passlib.context import CryptContext
import os
from jose import jwt
from datetime import datetime, timedelta
from backend.utils.redis_client import redis_client
import time

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS"))

def build_key(token:str):
    return f"blocked:{token}"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(app_user_id: str):
    expire = datetime.now() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": app_user_id,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def block_token(token: str, expires_in_seconds: int):
    redis_key = build_key(token=token)
    redis_client.set(name = redis_key, value = "blocked", ex=expires_in_seconds)

def is_token_blocked(token:str):
    redis_key = build_key(token=token)
    if redis_client.exists(redis_key) == 1:
        return True
    return False
