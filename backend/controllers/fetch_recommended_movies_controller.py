from fastapi import APIRouter, Depends
from database.database import get_db
from database.services.fetch_recommended_movies_service import fetch_recommended_movies_service
from backend.security.dependencies import get_current_user

router = APIRouter(prefix="/recommended_movies", tags=["App User Recommended Movies"])

@router.get("/")
def get_recommended_movies(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return fetch_recommended_movies_service(current_user=current_user, db=db)