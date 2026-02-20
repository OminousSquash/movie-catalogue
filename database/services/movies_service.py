from mysql.connector import MySQLConnection
from typing import Optional, List
import math

PAGE_SIZE = 50


def get_genres_service(db: MySQLConnection):
    """Fetches all genre names from the DB for the frontend filter list."""
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT genre FROM genres ORDER BY genre ASC")
    rows = cursor.fetchall()
    cursor.close()
    return [r["genre"] for r in rows if r["genre"]]


def get_distinct_roles_service(db: MySQLConnection):
    """
    DEBUG ONLY — returns every distinct role value stored in movie_contributors.
    Remove before final submission.
    """
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT role FROM movie_contributors ORDER BY role ASC LIMIT 100")
    rows = cursor.fetchall()
    cursor.close()
    return [r["role"] for r in rows]


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
    # CHANGED: removed joins list for contributors entirely.
    # Previously contributors used JOINs which caused a fundamental AND logic bug:
    # all contributor types (actor, director, writer) shared ONE join to
    # movie_contributors, connected with OR. This meant if a movie matched the
    # director condition, the actor condition was completely ignored — Nolan as
    # director satisfied the OR on its own, so adding batman as actor made no
    # difference at all.
    #
    # FIX: switched contributors to EXISTS subqueries. Each contributor type
    # (actor, director, writer) becomes its own independent EXISTS check on the
    # movie. A movie must satisfy ALL of them — if you specify both a director
    # and an actor, the movie must have BOTH that director AND that actor.
    joins = []
    conditions = []
    params = []

    # ── Title ──────────────────────────────────────────────────────────────────
    if title:
        conditions.append("m.primaryTitle LIKE %s")
        params.append(f"%{title}%")

    # ── Year ───────────────────────────────────────────────────────────────────
    if start_year:
        conditions.append("m.startYear >= %s")
        params.append(start_year)
    if end_year:
        conditions.append("m.startYear <= %s")
        params.append(end_year)

    # ── Rating ─────────────────────────────────────────────────────────────────
    # `is not None` — 0.0 is falsy but a valid filter value.
    # IS NOT NULL guard — SQL comparisons against NULL always evaluate to NULL
    # not true/false, silently dropping unrated movies without it.
    if min_rating is not None:
        conditions.append("m.averageRating IS NOT NULL AND m.averageRating >= %s")
        params.append(min_rating)
    if max_rating is not None:
        conditions.append("m.averageRating IS NOT NULL AND m.averageRating <= %s")
        params.append(max_rating)

    # ── Runtime ────────────────────────────────────────────────────────────────
    if min_runtime is not None:
        conditions.append("m.runtimeMinutes IS NOT NULL AND m.runtimeMinutes >= %s")
        params.append(min_runtime)
    if max_runtime is not None:
        conditions.append("m.runtimeMinutes IS NOT NULL AND m.runtimeMinutes <= %s")
        params.append(max_runtime)

    # ── Votes ──────────────────────────────────────────────────────────────────
    if min_votes is not None:
        conditions.append("m.numVotes IS NOT NULL AND m.numVotes >= %s")
        params.append(min_votes)
    if max_votes is not None:
        conditions.append("m.numVotes IS NOT NULL AND m.numVotes <= %s")
        params.append(max_votes)

    # ── Genres ─────────────────────────────────────────────────────────────────
    if genres:
        joins.append("JOIN movie_genres mg ON mg.tconst = m.tconst")
        joins.append("JOIN genres g ON mg.genreID = g.genreID")
        placeholders = ",".join(["%s"] * len(genres))
        conditions.append(f"g.genre IN ({placeholders})")
        params.extend(genres)

    # ── Tags ───────────────────────────────────────────────────────────────────
    # Table is movielens_tags (matches createDB.sql), not ml_tags.
    if tags:
        joins.append("JOIN links lnk ON CONCAT('tt', lnk.imdbId) = m.tconst")
        joins.append("JOIN movielens_tags mt ON mt.movieId = lnk.movieId")
        tag_placeholders = ",".join(["%s"] * len(tags))
        conditions.append(f"LOWER(mt.tag) IN ({tag_placeholders})")
        params.extend([t.lower() for t in tags])

    # ── Contributors — EXISTS subqueries ───────────────────────────────────────
    # Each contributor type is an independent EXISTS subquery.
    # A movie satisfies the condition only if it has a matching contributor row
    # for that specific role type. Multiple types are AND'd together at the
    # WHERE level — a movie must have ALL specified contributor types.
    #
    # Example: director=nolan AND actor=batman
    #   → movie must have a director whose name contains "nolan"
    #   AND a (separate) actor whose name contains "batman"
    #   A movie with only Nolan as director and no batman actor is excluded.
    #
    # Within each type, multiple names are OR'd — actor=tom,brad means
    # the movie needs an actor whose name contains "tom" OR "brad".
    #
    # LIKE '%name%' used instead of IN ('name') — IN is exact matching so
    # IN ('tom') only matches someone literally named "tom", not "Tom Hanks".
    # LIKE '%tom%' matches anyone whose name contains "tom".

    if actors:
        # Build one LIKE condition per actor name, OR'd together
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
        # TRIM(mc4.role) handles any residual \r on the role value in the DB.
        # If the DB was rebuilt after the createDB.sql fix, TRIM is a no-op.
        # If it wasn't rebuilt, TRIM strips the \r so 'writer\r' matches 'writer'.
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

    # ── Build and execute ──────────────────────────────────────────────────────
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

    # Attach genre list to each result in one batch query (not one per movie)
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