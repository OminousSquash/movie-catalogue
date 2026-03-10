from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from backend.DTOs.movie_filter_dto import MovieFilterDTO
import math
import os
from pathlib import Path
from functools import lru_cache

PAGE_SIZE = 50
POSTER_BASE_URL = os.getenv("POSTER_BASE_URL", "http://localhost:8000/posters")
POSTERS_DIR = Path(__file__).resolve().parents[2] / "datasets" / "movie-posters"

@lru_cache(maxsize=1)
def _get_poster_index():
    poster_index = {}
    if not POSTERS_DIR.exists():
        return poster_index
    for poster_file in POSTERS_DIR.iterdir():
        if poster_file.is_file() and poster_file.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            poster_index[poster_file.stem] = poster_file.name
    return poster_index

def get_movies_service(
    db: MySQLConnection,
    movie_filters: MovieFilterDTO,
    contributor_filters: MovieContributorFilterDTO,
    page: int
):
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be greater than or equal to 1"
        )

    cursor = db.cursor(dictionary=True)
    query = " FROM movies m "
    conditions = []
    params = []
    joins = []
    if movie_filters.title:
        conditions.append("m.primary_title LIKE %s")
        params.append(f"%{movie_filters.title}%")

    if movie_filters.start_year is not None:
        conditions.append("m.start_year >= %s")
        params.append(movie_filters.start_year)

    if movie_filters.end_year is not None:
        conditions.append("m.start_year <= %s")
        params.append(movie_filters.end_year)

    if movie_filters.min_rating is not None:
        conditions.append("m.average_rating >= %s")
        params.append(movie_filters.min_rating)

    if movie_filters.max_rating is not None:
        conditions.append("m.average_rating <= %s")
        params.append(movie_filters.max_rating)

    if movie_filters.min_runtime is not None:
        conditions.append("m.runtime_minutes >= %s")
        params.append(movie_filters.min_runtime)

    if movie_filters.max_runtime is not None:
        conditions.append("m.runtime_minutes <= %s")
        params.append(movie_filters.max_runtime)

    if movie_filters.min_votes is not None:
        conditions.append("m.num_votes >= %s")
        params.append(movie_filters.min_votes)

    if movie_filters.max_votes is not None:
        conditions.append("m.num_votes <= %s")
        params.append(movie_filters.max_votes)

    oscar_filters_present = any([
        movie_filters.oscar_year is not None,
        movie_filters.oscar_status is not None,
        bool(movie_filters.oscar_awards),
    ])
    if movie_filters.has_oscar is not None or oscar_filters_present:
        oscar_conditions = ["om.tconst = m.tconst"]
        oscar_params = []

        if movie_filters.oscar_year is not None:
            oscar_conditions.append("om.award_year = %s")
            oscar_params.append(movie_filters.oscar_year)

        if movie_filters.oscar_status is not None:
            oscar_conditions.append("om.award_status = %s")
            oscar_params.append(movie_filters.oscar_status)

        if movie_filters.oscar_awards:
            oscar_award_placeholder = ",".join(["%s"] * len(movie_filters.oscar_awards))
            oscar_conditions.append(f"om.award_name IN ({oscar_award_placeholder})")
            oscar_params.extend(movie_filters.oscar_awards)

        oscar_subquery = "SELECT 1 FROM oscar_movies om WHERE " + " AND ".join(oscar_conditions)

        if movie_filters.has_oscar is False:
            conditions.append(f"NOT EXISTS ({oscar_subquery})")
        else:
            conditions.append(f"EXISTS ({oscar_subquery})")

        params.extend(oscar_params)

    if movie_filters.genres:
        joins.append("JOIN movie_genres mg on mg.tconst = m.tconst") 
        joins.append("JOIN genres g on mg.genre_id = g.genre_id")
        genres_placeholder = " OR ".join(["g.genre LIKE %s"] * len(movie_filters.genres))
        conditions.append(f"({genres_placeholder})")
        params.extend(f"%{g}%" for g in movie_filters.genres)

    if movie_filters.tags:
        joins.append("JOIN movie_tags mt on mt.tconst = m.tconst")
        joins.append("JOIN tags t on mt.tag_id = t.tag_id")

        tags_placeholder = ",".join(["%s"] * len(movie_filters.tags))
        conditions.append(f"t.tag_name in ({tags_placeholder})")
        params.extend(movie_filters.tags)

    role_conditions = []
    if contributor_filters.actors:
        actors_placeholder = " OR ".join(["c.primary_name LIKE %s"] * len(contributor_filters.actors))
        role_conditions.append(f"(mc.role LIKE '%actor%' AND ({actors_placeholder}))")
        params.extend(f"%{a}%" for a in contributor_filters.actors)

    if contributor_filters.directors:
        directors_placeholders = " OR ".join(["c.primary_name LIKE %s"] * len(contributor_filters.directors))
        role_conditions.append(f"(mc.role LIKE '%director%' AND ({directors_placeholders}))")
        params.extend(f"%{d}%" for d in contributor_filters.directors)

    if contributor_filters.writers:
        writers_placeholders = " OR ".join(["c.primary_name LIKE %s"] * len(contributor_filters.writers))
        role_conditions.append(f"(mc.role LIKE '%writer%' AND ({writers_placeholders}))")
        params.extend(f"%{w}%" for w in contributor_filters.writers)

    if role_conditions:
        joins.append("JOIN movie_contributors mc on mc.tconst=m.tconst")
        joins.append("JOIN contributors c on c.nconst = mc.nconst")
        conditions.append("(" + " OR ".join(role_conditions) + ")")

    if joins:
        query += " " + " ".join(joins)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    offset = (page - 1) * PAGE_SIZE

    # build different queries
    data_query = """
    SELECT DISTINCT m.*
    """ + query + """
    ORDER BY m.average_rating DESC
    LIMIT %s OFFSET %s
    """

    count_query = "SELECT COUNT(DISTINCT m.tconst) " + query

    try:
        cursor.execute(count_query, params.copy())
        total = cursor.fetchone()["COUNT(DISTINCT m.tconst)"]
        data_params = params.copy()
        data_params.extend([PAGE_SIZE, offset])

        cursor.execute(data_query, data_params)
        rows = cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve movies"
        )
    poster_index = _get_poster_index()
    for row in rows:
        poster_name = poster_index.get(row.get("tconst", ""))
        row["poster"] = f"{POSTER_BASE_URL}/{poster_name}" if poster_name else None

    return {
        "data": rows,
        "page": page,
        "page_size": len(rows),
        "total": total,
        "total_pages": math.ceil(total / PAGE_SIZE)
    }

def get_genres_service(
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT genre_id, genre FROM genres WHERE LENGTH(TRIM(genre)) > 1 ORDER BY genre ASC")
        return cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve genres"
        )

def get_oscar_movies_service(
    db: MySQLConnection
):
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT
        m.*,
        SUM(CASE WHEN om.award_status = 'Winner' THEN 1 ELSE 0 END) AS oscar_wins,
        SUM(CASE WHEN om.award_status = 'Nominee' THEN 1 ELSE 0 END) AS oscar_nominations
    FROM movies m
    JOIN oscar_movies om ON om.tconst = m.tconst
    GROUP BY m.tconst
    ORDER BY oscar_wins DESC, oscar_nominations DESC, m.average_rating DESC
    """

    try:
        cursor.execute(query)
        rows = cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve Oscar movies"
        )

    poster_index = _get_poster_index()
    for row in rows:
        poster_name = poster_index.get(row.get("tconst", ""))
        row["poster"] = f"{POSTER_BASE_URL}/{poster_name}" if poster_name else None

    return rows


def get_movie_oscars_service(
    db: MySQLConnection,
    tconst: str,
):
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT
        id,
        tconst,
        award_year,
        award_name,
        award_status,
        recipient_name,
        recipient_nconst
    FROM oscar_movies
    WHERE tconst = %s
    ORDER BY award_year DESC, award_status DESC, award_name ASC, recipient_name ASC
    """

    try:
        cursor.execute(query, (tconst,))
        rows = cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve Oscar details"
        )

    return {
        "tconst": tconst,
        "count": len(rows),
        "data": rows,
    }

def get_predicted_ratings_service(
        db: MySQLConnection
    ):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                pr.tconst,
                m.primary_title,
                m.start_year,
                pr.predicted_rating,
                pr.prediction_uncertainty
            FROM predicted_ratings pr
            JOIN movies m ON pr.tconst = m.tconst
        """)
        return cursor.fetchall()
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve recent movies")


def get_predicted_rating_by_tconst_service( # Currently not in use, just here in case its needed
        db: MySQLConnection,
        tconst: str
    ):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM predicted_ratings WHERE tconst = %s",
            (tconst,)
        )
        result = cursor.fetchone()
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No predicted rating found for tconst: {tconst}"
            )
        return result
    except HTTPException:
        raise
    except Error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve recent movies")