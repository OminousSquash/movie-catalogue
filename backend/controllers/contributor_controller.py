from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from database.services.contributor_service import get_contributor_info_service

router = APIRouter(prefix="/contributor", tags=["contributor"])

@router.get("/{name}")
def get_contributor_info(
    name:str,
    db = Depends(get_db)
):
    return get_contributor_info_service(contributor=name, db=db)

