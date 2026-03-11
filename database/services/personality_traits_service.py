from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.personality_correlation_dto import PersonalityCorrelationDTO
from backend.DTOs.genre_profiles_dto import GenreProfilesDTO

traits = ["openness", "agreeableness", "emotional_stability", "conscientiousness", "extraversion"]
# these are fixed also
POPULATION_MEANS = {"openness": 5.37280, "agreeableness": 4.21538, "emotional_stability": 4.56401, "conscientiousness": 4.66401, "extraversion": 3.48022} 
# I wroked out these value and hardcoded them to save time when processing as our dataset isn't going to change 


def get_personality_genre_correlations_service(
    personality_corr_dto: PersonalityCorrelationDTO,
    db:MySQLConnection
):
    query = """
        WITH user_mean AS (
            SELECT dataset_user_id, AVG(rating) AS mean_rating
            FROM dataset_user_ratings
            GROUP BY dataset_user_id
        ),
        norm_ratings AS (
            SELECT
                p.dataset_user_id,
                g.genre,
                p.openness,
                p.agreeableness,
                p.emotional_stability,
                p.conscientiousness,
                p.extraversion,
                AVG(ur.rating) - um.mean_rating AS norm_rating
            FROM dataset_user_ratings ur
            JOIN movie_genres mg ON mg.tconst = ur.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            JOIN user_mean um ON um.dataset_user_id = ur.dataset_user_id
            JOIN dataset_user_personalities p ON p.dataset_user_id = ur.dataset_user_id
            WHERE LENGTH(TRIM(g.genre)) > 1
            GROUP BY ur.dataset_user_id, g.genre, p.openness, p.agreeableness, p.emotional_stability, p.conscientiousness, p.extraversion
        ),
        components AS (
            SELECT
                genre,
                COUNT(*) AS n,
                SUM(norm_rating) AS sum_y,
                SUM(norm_rating * norm_rating) AS sum_y2,

                SUM(openness) AS sum_open,
                SUM(openness * openness) AS sum_open2,
                SUM(openness * norm_rating) AS sum_open_y,

                SUM(agreeableness) AS sum_agree,
                SUM(agreeableness * agreeableness) AS sum_agree2,
                SUM(agreeableness * norm_rating) AS sum_agree_y,

                SUM(emotional_stability) AS sum_es,
                SUM(emotional_stability * emotional_stability) AS sum_es2,
                SUM(emotional_stability * norm_rating) AS sum_es_y,

                SUM(conscientiousness) AS sum_consc,
                SUM(conscientiousness * conscientiousness) AS sum_consc2,
                SUM(conscientiousness * norm_rating) AS sum_consc_y,

                SUM(extraversion) AS sum_extra,
                SUM(extraversion * extraversion) AS sum_extra2,
                SUM(extraversion * norm_rating) AS sum_extra_y

            FROM norm_ratings GROUP BY genre
        )
        SELECT
            genre,
            ROUND(
                (n * sum_open_y - sum_open * sum_y) / NULLIF(SQRT((n * sum_open2 - sum_open * sum_open) * (n * sum_y2 - sum_y * sum_y)), 0), 4
            ) AS r_openness,

            ROUND(
                (n * sum_agree_y - sum_agree * sum_y) / NULLIF(SQRT((n * sum_agree2 - sum_agree * sum_agree) * (n * sum_y2 - sum_y * sum_y)), 0), 4
            ) AS r_agreeableness,

            ROUND(
                (n * sum_es_y - sum_es * sum_y) / NULLIF(SQRT((n * sum_es2 - sum_es * sum_es) * (n * sum_y2 - sum_y * sum_y)), 0), 4
            ) AS r_emotional_stability,

            ROUND(
                (n * sum_consc_y - sum_consc * sum_y) / NULLIF(SQRT((n * sum_consc2 - sum_consc * sum_consc) * (n * sum_y2 - sum_y * sum_y)), 0), 4
            ) AS r_conscientiousness,

            ROUND(
                (n * sum_extra_y - sum_extra * sum_y) / NULLIF(SQRT((n * sum_extra2 - sum_extra * sum_extra) * (n * sum_y2 - sum_y * sum_y)), 0), 4
            ) AS r_extraversion

            FROM components ORDER BY genre ASC
    """
    
    params = []
    
    b = personality_corr_dto.personality_or_genre_b
    if b:
        query = f"SELECT * FROM ({query}) AS corr WHERE genre = %s"
        params.append(b)

    try:
        cursor = db.cursor(dictionary = True)
        cursor.execute(query, params)
        rows = cursor.fetchall()
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retirieve correlation data: {str(e)}"
        )
    
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No data found"
        )
    
    a = personality_corr_dto.personality_or_genre_a

    if a and a not in traits:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid trait '{a}'. Valid traits: {traits}"
        )

    results = []
    for row in rows:
        entry = {
            "genre": row["genre"],
            "correlations": {}
        }
        for t in traits:
            r_val = float(row[f"r_{t}"] or 0)
            if not a or t == a:
                entry["correlations"][t] = {
                    "r": r_val,
                    "direction": "positive" if r_val > 0 else "negative" if r_val < 0 else "none"
                }
        results.append(entry)

    if a:
        results.sort(key=lambda x: x["correlations"][a]["r"], reverse=True)

    return results

def get_genre_personality_profiles_service(
    genre_profile_dto: GenreProfilesDTO,
    db:MySQLConnection
):
    query = """
        SELECT
            g.genre,
            ROUND(AVG(p.openness), 3) AS avg_openness,
            ROUND(AVG(p.agreeableness), 3) AS avg_agreeableness,
            ROUND(AVG(p.emotional_stability), 3) AS avg_emotional_stability,
            ROUND(AVG(p.conscientiousness), 3) AS avg_conscientiousness,
            ROUND(AVG(p.extraversion), 3) AS avg_extraversion,
            COUNT(DISTINCT p.dataset_user_id) AS user_count
        FROM dataset_user_ratings ur
        JOIN movie_genres mg ON mg.tconst = ur.tconst
        JOIN genres g ON g.genre_id = mg.genre_id
        JOIN dataset_user_personalities p ON p.dataset_user_id = ur.dataset_user_id
        WHERE LENGTH(TRIM(g.genre)) > 1
        GROUP BY g.genre_id, g.genre
        HAVING user_count >= %s
        ORDER BY g.genre ASC
    """

    params = [genre_profile_dto.minimum_no_users]

    if genre_profile_dto.genre:
        query = f"SELECT * FROM ({query}) AS profiles WHERE genre = %s"
        params.append(genre_profile_dto.genre)

    try:
        cursor = db.cursor(dictionary = True)
        cursor.execute(query, params)
        rows = cursor.fetchall()
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve gener profiles: {str(e)}"
        )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No data found for genre '{genre_profile_dto.genre}'"
                if genre_profile_dto.genre else "No genre profile data found"
            )
        )

    results = []
    for row in rows:
        entry = {
            "genre": row["genre"],
            "user_count": int(row["user_count"]),
            "traits": {}
        }
        for t in traits:
            avg = float(row[f"avg_{t}"])
            entry["traits"][t] = {
                "avg": round(avg, 3),
                "deviation": round(avg - POPULATION_MEANS[t], 3)
            }
        results.append(entry)

    return results