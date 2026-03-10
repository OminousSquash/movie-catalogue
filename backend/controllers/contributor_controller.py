from fastapi import APIRouter, Depends
from database.database import get_db
from database.services.contributor_service import get_contributor_info_service

router = APIRouter(prefix="/contributor", tags=["contributor"])

@router.get("/{nconst}")
def get_contributor_info(
    nconst: str,
    db = Depends(get_db)
):
    return get_contributor_info_service(nconst=nconst, db=db)
