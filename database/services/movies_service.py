from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from backend.DTOs.movie_filter_dto import MovieFilterDTO
import math

PAGE_SIZE = 50

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

    if movie_filters.start_year:
        conditions.append("m.start_year >= %s")
        params.append(movie_filters.start_year)

    if movie_filters.end_year:
        conditions.append("m.start_year <= %s")
        params.append(movie_filters.end_year)

    if movie_filters.min_rating:
        conditions.append("m.average_rating >= %s")
        params.append(movie_filters.min_rating)

    if movie_filters.max_rating:
        conditions.append("m.average_rating <= %s")
        params.append(movie_filters.max_rating)

    if movie_filters.min_runtime:
        conditions.append("m.runtime_minutes >= %s")
        params.append(movie_filters.min_runtime)

    if movie_filters.max_runtime:
        conditions.append("m.runtime_minutes <= %s")
        params.append(movie_filters.max_runtime)

    if movie_filters.min_votes:
        conditions.append("m.num_votes >= %s")
        params.append(movie_filters.min_votes)

    if movie_filters.max_votes:
        conditions.append("m.num_votes <= %s")
        params.append(movie_filters.max_votes)

    if movie_filters.genres:
        joins.append("JOIN movie_genres mg on mg.tconst = m.tconst") 
        joins.append("JOIN genres g on mg.genre_id = g.genre_id")
    
        genres_placeholder = ",".join(["%s"] * len(movie_filters.genres))
        conditions.append(f"g.genre IN ({genres_placeholder})")
        params.extend(movie_filters.genres)

    role_conditions = []
    if contributor_filters.actors:
        actors_placeholder = ",".join(["%s"] * len(contributor_filters.actors))
        role_conditions.append(f"mc.role LIKE '%actor%' AND c.primary_name IN ({actors_placeholder})")
        params.extend(contributor_filters.actors)

    if contributor_filters.directors:
        directors_placeholders = ",".join(["%s"] * len(contributor_filters.directors))
        role_conditions.append(f"mc.role LIKE '%director%' AND c.primary_name in ({directors_placeholders})")
        params.extend(contributor_filters.directors)
    
    if contributor_filters.writers:
        writers_placeholders = ",".join(["%s"] * len(contributor_filters.writers))
        role_conditions.append(f"mc.role LIKE '%writer%' AND c.primary_name in ({writers_placeholders})")
        params.extend(contributor_filters.writers)

    if role_conditions:
        joins.append("JOIN movie_contributors mc on mc.tconst=m.tconst")
        joins.append("JOIN contributors c on c.nconst = mc.nconst")
        conditions.append('(' + ' AND '.join(role_conditions ) + ')')

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

    return {
        "data": rows,
        "page": page,
        "page_size": len(rows),
        "total": total,
        "total_pages": math.ceil(total / PAGE_SIZE)
    }
