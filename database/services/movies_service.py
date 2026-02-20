from mysql.connector import MySQLConnection
from typing import Optional, List
import math

PAGE_SIZE = 50


def get_genres_service(db: MySQLConnection):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT genre FROM genres ORDER BY genre ASC")
    rows = cursor.fetchall()
    cursor.close()
    return [r["genre"] for r in rows if r["genre"]]

def get_movies_service(
    db: MySQLConnection,
    title: Optional[str],
    start_year: Optional[int],
    end_year: Optional[int],
    min_rating: Optional[float],
    max_rating: Optional[float],
    min_runtime: Optional[int],
    max_runtime: Optional[int],
    min_votes: Optional[int],
    max_votes: Optional[int],
    genres: Optional[List[str]],
    tags: Optional[List[str]],
    actors: Optional[List[str]],
    directors: Optional[List[str]],
    writers: Optional[List[str]],
    page: int
):
    cursor = db.cursor(dictionary=True)
    joins = []
    conditions = []
    params = []

    if title:
        conditions.append("m.primaryTitle LIKE %s")
        params.append(f"%{title}%")

    if start_year:
        conditions.append("m.startYear >= %s")
        params.append(start_year)
    if end_year:
        conditions.append("m.startYear <= %s")
        params.append(end_year)

    if min_rating is not None:
        conditions.append("m.averageRating IS NOT NULL AND m.averageRating >= %s")
        params.append(min_rating)

    if max_rating is not None:
        conditions.append("m.averageRating IS NOT NULL AND m.averageRating <= %s")
        params.append(max_rating)

    if min_runtime is not None:
        conditions.append("m.runtimeMinutes IS NOT NULL AND m.runtimeMinutes >= %s")
        params.append(min_runtime)

    if max_runtime is not None:
        conditions.append("m.runtimeMinutes IS NOT NULL AND m.runtimeMinutes <= %s")
        params.append(max_runtime)

    if min_votes is not None:
        conditions.append("m.numVotes IS NOT NULL AND m.numVotes >= %s")
        params.append(min_votes)

    if max_votes is not None:
        conditions.append("m.numVotes IS NOT NULL AND m.numVotes <= %s")
        params.append(max_votes)

    if genres:
        joins.append("JOIN movie_genres mg ON mg.tconst = m.tconst")
        joins.append("JOIN genres g ON mg.genreID = g.genreID")
        placeholders = ",".join(["%s"] * len(genres))
        conditions.append(f"g.genre IN ({placeholders})")
        params.extend(genres)

    if tags:
        joins.append("JOIN links lnk ON CONCAT('tt', lnk.imdbId) = m.tconst")
        joins.append("JOIN movielens_tags mt ON mt.movieId = lnk.movieId")
        tag_placeholders = ",".join(["%s"] * len(tags))
        conditions.append(f"LOWER(mt.tag) IN ({tag_placeholders})")
        params.extend([t.lower() for t in tags])

    if actors:
        name_conditions = " OR ".join(
            ["LOWER(c2.primaryName) LIKE %s"] * len(actors)
        )
        conditions.append(f"""
            EXISTS (
                SELECT 1
                FROM movie_contributors mc2
                JOIN contributors c2 ON c2.nconst = mc2.nconst
                WHERE mc2.tconst = m.tconst
                  AND TRIM(mc2.role) IN ('actor', 'actress')
                  AND ({name_conditions})
            )
        """)
        params.extend([f"%{a.lower()}%" for a in actors])

    if directors:
        name_conditions = " OR ".join(
            ["LOWER(c3.primaryName) LIKE %s"] * len(directors)
        )
        conditions.append(f"""
            EXISTS (
                SELECT 1
                FROM movie_contributors mc3
                JOIN contributors c3 ON c3.nconst = mc3.nconst
                WHERE mc3.tconst = m.tconst
                  AND TRIM(mc3.role) = 'director'
                  AND ({name_conditions})
            )
        """)
        params.extend([f"%{d.lower()}%" for d in directors])

    if writers:
        name_conditions = " OR ".join(
            ["LOWER(c4.primaryName) LIKE %s"] * len(writers)
        )
        conditions.append(f"""
            EXISTS (
                SELECT 1
                FROM movie_contributors mc4
                JOIN contributors c4 ON c4.nconst = mc4.nconst
                WHERE mc4.tconst = m.tconst
                  AND TRIM(mc4.role) = 'writer'
                  AND ({name_conditions})
            )
        """)
        params.extend([f"%{w.lower()}%" for w in writers])

    base = "FROM movies m " + " ".join(joins)
    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    print(f"[movies_service] WHERE: {where}")
    print(f"[movies_service] PARAMS: {params}")

    cursor.execute(
        f"SELECT COUNT(DISTINCT m.tconst) AS total {base} {where}",
        params.copy()
    )
    total = cursor.fetchone()["total"]

    offset = (page - 1) * PAGE_SIZE
    data_params = params.copy()
    data_params.extend([PAGE_SIZE, offset])

    cursor.execute(f"""
        SELECT DISTINCT
            m.tconst,
            m.primaryTitle,
            m.startYear,
            m.averageRating,
            m.numVotes,
            m.runtimeMinutes,
            m.isAdult
        {base}
        {where}
        ORDER BY m.averageRating DESC
        LIMIT %s OFFSET %s
    """, data_params)
    rows = cursor.fetchall()

    if rows:
        tconsts = [r["tconst"] for r in rows]
        placeholders = ",".join(["%s"] * len(tconsts))
        cursor.execute(f"""
            SELECT mg2.tconst, g2.genre
            FROM movie_genres mg2
            JOIN genres g2 ON g2.genreID = mg2.genreID
            WHERE mg2.tconst IN ({placeholders})
        """, tconsts)
        genre_map = {}
        for gr in cursor.fetchall():
            genre_map.setdefault(gr["tconst"], []).append(gr["genre"])
        for row in rows:
            row["genres"] = genre_map.get(row["tconst"], [])

    cursor.close()
    return {
        "data": rows,
        "page": page,
        "page_size": len(rows),
        "total": total,
        "total_pages": math.ceil(total / PAGE_SIZE) if total else 0
    }


def get_recent_movies_service(db: MySQLConnection, limit: int = 20):
    """Returns the most recently released movies that have a valid rating."""
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            m.tconst,
            m.primaryTitle,
            m.startYear,
            m.averageRating,
            m.numVotes,
            m.runtimeMinutes
        FROM movies m
        WHERE m.startYear IS NOT NULL
          AND m.averageRating IS NOT NULL
        ORDER BY m.startYear DESC, m.numVotes DESC
        LIMIT %s
    """, (limit,))
    rows = cursor.fetchall()

    if rows:
        tconsts = [r["tconst"] for r in rows]
        placeholders = ",".join(["%s"] * len(tconsts))
        cursor.execute(f"""
            SELECT mg.tconst, g.genre
            FROM movie_genres mg
            JOIN genres g ON g.genreID = mg.genreID
            WHERE mg.tconst IN ({placeholders})
        """, tconsts)
        genre_map = {}
        for gr in cursor.fetchall():
            genre_map.setdefault(gr["tconst"], []).append(gr["genre"])
        for row in rows:
            row["genres"] = genre_map.get(row["tconst"], [])

    cursor.close()
    return rows