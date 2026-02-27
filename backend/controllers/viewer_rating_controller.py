from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.viewer_rating_analysis_service import get_correlation_matrix_service
from database.services.viewer_rating_analysis_service import get_cluster_summary_service
from database.services.viewer_rating_analysis_service import get_conditional_high_rating_service
from database.services.viewer_rating_analysis_service import get_conditional_low_rating_service
from database.services.viewer_rating_analysis_service import get_low_rating_genres_service
from database.services.viewer_rating_analysis_service import get_rating_harshness_service
from database.database import get_db
 
router = APIRouter(prefix="/rating_analysis", tags=["rating analysis"])

@router.get("/viewer_harshness")
def get_viewer_harshness(
    db=Depends(get_db)
):
    return get_rating_harshness_service(db)

@router.get("/low_rating_genres")
def get_low_rating_genres(
    db=Depends(get_db)
):
    return get_low_rating_genres_service(db)

@router.get("/genre_correlation_matrix")
def get_genre_correlation_matrix(
    db=Depends(get_db)
):
    return get_correlation_matrix_service(db)

@router.get("/cluster_summary")
def get_cluster_summary(
    n_clusters: int = 5,
    db=Depends(get_db)
):
    return get_cluster_summary_service(db, n_clusters)

@router.get("/conditional_low_rating")
def get_conditional_low_rating(
    genre_a: str,
    genre_b: str,
    db=Depends(get_db)
):
    return get_conditional_low_rating_service(db, genre_a, genre_b)

@router.get("/conditional_high_rating")
def get_conditional_high_rating(
    genre_a: str,
    genre_b: str,
    db = Depends(get_db)
):
    return get_conditional_high_rating_service(db=db, genre_a=genre_a, genre_b=genre_b)