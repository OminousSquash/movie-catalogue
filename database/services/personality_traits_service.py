from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
import pandas as pd
from backend.DTOs.personality_correlation_dto import PersonalityCorrelationDTO

def get_personality_genre_correlations_service(
    personality_corr_dto: PersonalityCorrelationDTO,
    db:MySQLConnection
):
    personality_query = """
    SELECT *
    FROM dataset_user_personalities
    """

    genre_query = """
    SELECT ur.dataset_user_id, g.genre, AVG(ur.rating) AS avg_genre_rating
    FROM dataset_user_ratings ur
    JOIN movie_genres mg ON ur.tconst = mg.tconst
    JOIN genres g ON g.genre_id = mg.genre_id
    GROUP BY ur.dataset_user_id, g.genre
    """

    try:
        personality_df = pd.read_sql(personality_query, db)
        genre_df = pd.read_sql(genre_query, db)
    except (Error, pd.errors.DatabaseError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve personality correlation data"
        )

    if personality_df.empty or genre_df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enough personality or ratings data to calculate correlations"
        )

    genre_table = genre_df.pivot_table(
        index='dataset_user_id',
        columns='genre',
        values='avg_genre_rating'
    )

    merged = personality_df.merge(
        genre_table,
        left_on='dataset_user_id',
        right_index=True
    )

    if merged.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No overlapping personality and ratings data found"
        )

    traits = ["openness", "agreeableness", "emotional_stability",
          "conscientiousness", "extraversion"]

    genres = genre_table.columns.tolist()
    corr = merged[traits + genres].corr()
    a = personality_corr_dto.personality_or_genre_a
    b = personality_corr_dto.personality_or_genre_b

    if a and b:
        if a not in corr.columns or b not in corr.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid trait or genre name"
            )
        return {
            "variable_a": a,
            "variable_b": b,
            "correlation": float(corr.loc[a, b])
        }

    elif a:
        if a not in corr.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid trait or genre name"
            )
        return corr.loc[a].to_dict()

    elif b:
        if b not in corr.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid trait or genre name"
            )
        return corr.loc[b].to_dict()

    return corr.to_dict()
