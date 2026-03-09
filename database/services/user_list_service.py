from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.create_user_list_dto import CreateUserListDTO
from backend.DTOs.add_movie_to_list_dto import AddMovieToListDTO
from backend.DTOs.update_list_name_dto import UpdateListNameDTO
from backend.DTOs.update_list_note_dto import UpdateListNoteDTO

def get_public_user_lists_service(db: MySQLConnection):
    try:
        cursor = db.cursor(dictionary=True)
        query = """
        SELECT
            ul.list_id,
            ul.list_name,
            ul.list_note,
            au.app_username AS creator_username,
            COUNT(ulm.tconst) AS movie_count,
            MIN(ulm.tconst) AS cover_tconst
        FROM app_user_lists ul
        JOIN app_users au ON au.app_user_id = ul.app_user_id
        LEFT JOIN app_user_list_movies ulm ON ulm.list_id = ul.list_id
        GROUP BY ul.list_id, ul.list_name, ul.list_note, au.app_username
        ORDER BY ul.list_id DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve public lists"
        )


def get_my_user_lists_service(
    app_user_id: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)
        query = """
        SELECT
            ul.list_id,
            ul.list_name,
            ul.list_note,
            au.app_username AS creator_username,
            COUNT(ulm.tconst) AS movie_count,
            MIN(ulm.tconst) AS cover_tconst
        FROM app_user_lists ul
        JOIN app_users au ON au.app_user_id = ul.app_user_id
        LEFT JOIN app_user_list_movies ulm ON ulm.list_id = ul.list_id
        WHERE ul.app_user_id = %s
        GROUP BY ul.list_id, ul.list_name, ul.list_note, au.app_username
        ORDER BY ul.list_id DESC
        """
        cursor.execute(query, (app_user_id,))
        return cursor.fetchall()
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve your lists"
        )


def create_user_list_service(
    create_user_list_dto: CreateUserListDTO,
    app_user_id: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
        create_list_query = """
        INSERT INTO app_user_lists (app_user_id, list_name, list_note)
        VALUES (%s, %s, %s)
        """
        cursor.execute(
            create_list_query,
            (
                app_user_id, 
                create_user_list_dto.list_name, 
                create_user_list_dto.list_note,
            )
        )
        db.commit()
        return {
            "message": "Successfully create list", 
            "list_id":cursor.lastrowid
        }
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create list"
        )

def update_list_name_service(
        list_id: int,
        app_user_id: int, 
        db: MySQLConnection,
        updated_list_name_dto: UpdateListNameDTO
):
    try:
        cursor = db.cursor(dictionary = True)
        new_list_name = updated_list_name_dto.new_list_name
        get_list_metadata_query = """
        SELECT 1
        FROM app_user_lists
        WHERE list_id=%s AND app_user_id = %s
        """
        cursor.execute(get_list_metadata_query, (list_id, app_user_id))
        list_metadata = cursor.fetchone()
        if not list_metadata:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

        update_list_query = """
        UPDATE app_user_lists
        SET list_name = %s
        WHERE list_id = %s AND app_user_id = %s
        """

        cursor.execute(update_list_query, (new_list_name, list_id, app_user_id,))
        db.commit()
        return {"message": "List updated successfully", "new_list_name": new_list_name}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update list name"
        )

def update_list_note_service (
    list_id: int, 
    app_user_id: int, 
    db: MySQLConnection,
    update_list_note_dto: UpdateListNoteDTO
):
    try:
        cursor = db.cursor(dictionary = True)
        new_list_note = update_list_note_dto.new_list_note
        get_list_metadata_query = """
        SELECT 1
        FROM app_user_lists
        WHERE list_id=%s AND app_user_id = %s
        """
        cursor.execute(get_list_metadata_query, (list_id, app_user_id,))
        list_metadata = cursor.fetchone()
        if not list_metadata:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

        update_list_query = """
        UPDATE app_user_lists
        SET list_note= %s
        WHERE list_id = %s AND app_user_id = %s
        """

        cursor.execute(update_list_query, (new_list_note, list_id, app_user_id))
        db.commit()
        return {"message": "List updated successfully", "new_list_note": new_list_note}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update list note"
        )
    


def add_movie_to_list_service(
    app_user_id: int,
    list_id: int,
    db: MySQLConnection,
    add_movie_to_list_dto: AddMovieToListDTO
):
    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT 1 
            FROM app_user_lists
            WHERE list_id = %s AND app_user_id = %s
            """,
            (list_id, app_user_id)
        )

        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )

        cursor.execute(
            "SELECT 1 FROM movies WHERE tconst = %s",
            (add_movie_to_list_dto.movie_id,)
        )

        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )

        cursor.execute(
            """
            SELECT 1 FROM app_user_list_movies
            WHERE list_id = %s AND tconst = %s
            """,
            (list_id, add_movie_to_list_dto.movie_id)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Movie already in list"
            )

        cursor.execute(
            """
            INSERT INTO app_user_list_movies (list_id, tconst)
            VALUES (%s, %s)
            """,
            (list_id, add_movie_to_list_dto.movie_id)
        )

        db.commit()

        return {"message": "Movie added successfully"}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add movie to list"
        )

def delete_user_list_service(
    list_id: int,
    app_user_id:int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
        get_list_metadata_query = """
        SELECT * FROM app_user_lists WHERE list_id = %s AND app_user_id=%s
        """
        cursor.execute(get_list_metadata_query, (list_id, app_user_id,))
        metadata = cursor.fetchone()
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )

        delete_movies_in_list_query = """
        DELETE
        FROM app_user_list_movies
        WHERE list_id = %s
        """
        delete_list_metadata_query = """
        DELETE
        FROM app_user_lists
        WHERE list_id = %s
        """
        cursor.execute(delete_movies_in_list_query, (list_id,))
        cursor.execute(delete_list_metadata_query, (list_id,))
        db.commit()
        return  {"message": "Successfully deleted list"}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete list"
        )

def get_user_list_service(
    user_list_id: int,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
        get_list_metadata_query = """
        SELECT * FROM app_user_lists WHERE list_id = %s
        """
        cursor.execute(get_list_metadata_query, (user_list_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )

        get_list_movies_query = """
            SELECT
                g.genre,
                m.primary_title
            FROM app_user_lists ul
            JOIN app_user_list_movies ulm ON ul.list_id = ulm.list_id
            JOIN movies m ON ulm.tconst = m.tconst
            JOIN movie_genres mg ON mg.tconst = m.tconst
            JOIN genres g ON g.genre_id = mg.genre_id
            WHERE ul.list_id = %s
            ORDER BY g.genre, m.primary_title;
        """
        cursor.execute(get_list_movies_query, (user_list_id,))
        list_movies = cursor.fetchall()
        grouped_result = {}
        for movie in list_movies:
            genre = movie["genre"]
            movie_name = movie["primary_title"]
            if genre not in grouped_result:
                grouped_result[genre] = []
            grouped_result[genre].append(movie_name)
        
        result["movies"] = grouped_result
        return result
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve list"
        )
