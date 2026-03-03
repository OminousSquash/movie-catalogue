from mysql.connector import MySQLConnection
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

    personality_df = pd.read_sql(personality_query, db)
    genre_df = pd.read_sql(genre_query, db)

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

    traits = ["openness", "agreeableness", "emotional_stability",
          "conscientiousness", "extraversion"]

    genres = genre_table.columns.tolist()

    corr = merged[traits + genres].corr()
    a = personality_corr_dto.personality_or_genre_a
    b = personality_corr_dto.personality_or_genre_b

    if a and b:
        if a not in corr.columns or b not in corr.columns:
            raise ValueError("Invalid trait or genre name")
        return {
            "variable_a": a,
            "variable_b": b,
            "correlation": float(corr.loc[a, b])
        }

    elif a:
        if a not in corr.columns:
            raise ValueError("Invalid trait or genre name")
        return corr.loc[a].to_dict()

    elif b:
        if b not in corr.columns:
            raise ValueError("Invalid trait or genre name")
        return corr.loc[b].to_dict()

    return corr.to_dict()    
