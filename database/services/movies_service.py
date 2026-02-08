from mysql.connector import MySQLConnection
from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from backend.DTOs.movie_filter_dto import MovieFilterDTO

PAGE_SIZE = 50

def get_movies_service(
    db: MySQLConnection,
    movie_filters: MovieFilterDTO,
    contributor_filters: MovieContributorFilterDTO,
    page: int
):
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT DISTINCT m.*
    FROM movies m
    """
    conditions = []
    params = []
    joins = []
    if movie_filters.title:
        conditions.append("m.primaryTitle LIKE %s")
        params.append(f"%{movie_filters.title}%")

    if movie_filters.start_year:
        conditions.append("m.startYear >= %s")
        params.append(movie_filters.start_year)

    if movie_filters.end_year:
        conditions.append("m.startYear <= %s")
        params.append(movie_filters.end_year)

    if movie_filters.min_rating:
        conditions.append("m.averageRating >= %s")
        params.append(movie_filters.min_rating)

    if movie_filters.max_rating:
        conditions.append("m.averageRating <= %s")
        params.append(movie_filters.max_rating)

    if movie_filters.min_runtime:
        conditions.append("m.runTime >= %s")
        params.append(movie_filters.min_runtime)

    if movie_filters.max_runtime:
        conditions.append("m.runTime <= %s")
        params.append(movie_filters.max_runtime)

    if movie_filters.min_votes:
        conditions.append("m.numVotes >= %s")
        params.append(movie_filters.min_votes)

    if movie_filters.max_votes:
        conditions.append("m.numVotes <= %s")
        params.append(movie_filters.max_votes)

    if movie_filters.genres:
        joins.append("JOIN movie_genres mg on mg.tconst = m.tconst") 
        joins.append("JOIN genres g on mg.genreID = g.genreID")
    
        genres_placeholder = ",".join(["%s"] * len(movie_filters.genres))
        conditions.append(f"g.genre IN ({genres_placeholder})")
        params.extend(movie_filters.genres)

    role_conditions = []
    if contributor_filters.actors:
        actors_placeholder = ",".join(["%s"] * len(contributor_filters.actors))
        role_conditions.append(f"mc.role = 'actor' AND c.primaryName IN ({actors_placeholder})")
        params.extend(contributor_filters.actors)

    if contributor_filters.directors:
        directors_placeholders = ",".join(["%s"] * len(contributor_filters.directors))
        role_conditions.append(f"mc.role = 'director' AND c.primaryName in ({directors_placeholders})")
        params.extend(contributor_filters.directors)
    
    if contributor_filters.writers:
        writers_placeholders = ",".join(["%s"] * len(contributor_filters.writers))
        role_conditions.append(f"mc.role='writer' AND c.primaryName in ({writers_placeholders})")
        params.extend(contributor_filters.writers)

    if role_conditions:
        joins.append("JOIN movie_contributors mc on mc.tconst=m.tconst")
        joins.append("JOIN contributors c on c.nconst = mc.nconst")
        conditions.append('(' + ' OR '.join(role_conditions ) + ')')

    if joins:
        query += " " + " ".join(joins)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    offset = (page - 1) * PAGE_SIZE
    query += " ORDER BY m.averageRating DESC LIMIT %s OFFSET %s"
    params.extend([PAGE_SIZE, offset])
    print("SQL QUERY: ")
    print(query)
    print("SQL PARAMS: ")
    print(params)
    cursor.execute(query, params)
    return cursor.fetchall()
