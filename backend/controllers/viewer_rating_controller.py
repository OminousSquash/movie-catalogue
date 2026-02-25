from fastapi import APIRouter, Query, Depends, FastAPI
from database.services.viewer_rating_analysis_service import get_correlation_matrix_service, get_low_rating_genres_service, get_rating_harshness_service, get_user_segments_service, get_cluster_summary_service ,get_conditional_low_rating_service
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO
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

@router.get("/user_segments")
def get_user_segments(
        db=Depends(get_db),
        n_clusters: int = Query(5, ge=2, le=10)
):
    return get_user_segments_service(db, n_clusters)

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
