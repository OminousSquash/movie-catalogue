from mysql.connector import MySQLConnection
from fastapi import HTTPException, status
from backend.DTOs.create_user_list_dto import CreateUserListDTO
from backend.DTOs.add_movie_to_list_dto import AddMovieToListDTO
from backend.DTOs.update_list_name_dto import UpdateListNameDTO
from backend.DTOs.update_list_note_dto import UpdateListNoteDTO

def create_user_list_service(
    create_user_list_dto: CreateUserListDTO,
    user_id: int,
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    create_list_query = """
    INSERT INTO user_lists (user_id, list_name, list_note)
    VALUES (%s, %s, %s)
    """
    cursor.execute(
        create_list_query,
        (
            user_id, 
            create_user_list_dto.list_name, 
            create_user_list_dto.list_note,
        )
    )
    db.commit()
    return {
        "message": "Successfully create list", 
        "list_id":cursor.lastrowid
    }

def update_list_name_service(
        list_id: int,
        user_id: int, 
        db: MySQLConnection,
        updated_list_name_dto: UpdateListNameDTO
):
    cursor = db.cursor(dictionary = True)
    new_list_name = updated_list_name_dto.list_name
    get_list_metadata_query = """
    SELECT 1
    FROM user_lists
    WHERE list_id=%s AND user_id = %s
    """
    cursor.execute(get_list_metadata_query, (list_id, user_id))
    list_metadata = cursor.fetchone()
    if not list_metadata:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    update_list_query = """
    UPDATE user_lists
    SET list_name = %s
    WHERE list_id = %s AND user_id = %s
    """

    cursor.execute(update_list_query, (new_list_name, list_id, user_id,))
    db.commit()
    return {"message": "List updated successfully", "new_list_name": new_list_name}

def update_list_note_service (
    list_id: int, 
    user_id: int, 
    db: MySQLConnection,
    update_list_note_dto: UpdateListNoteDTO
):
    cursor = db.cursor(dictionary = True)
    new_list_note = update_list_note_dto.new_list_note
    get_list_metadata_query = """
    SELECT 1
    FROM user_lists
    WHERE list_id=%s AND user_id = %s
    """
    cursor.execute(get_list_metadata_query, (list_id, user_id,))
    list_metadata = cursor.fetchone()
    if not list_metadata:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    update_list_query = """
    UPDATE user_lists
    SET list_note= %s
    WHERE list_id = %s AND user_id = %s
    """

    cursor.execute(update_list_query, (new_list_note, list_id, user_id))
    db.commit()
    return {"message": "List updated successfully", "new_list_note": new_list_note}
    


def add_movie_to_list_service(
    user_id: int,
    list_id: int,
    db: MySQLConnection,
    add_movie_to_list_dto: AddMovieToListDTO
):
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT 1 
        FROM user_lists
        WHERE list_id = %s AND user_id = %s
        """,
        (list_id, user_id)
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
        SELECT 1 FROM user_list_movies
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
        INSERT INTO user_list_movies (list_id, tconst)
        VALUES (%s, %s)
        """,
        (list_id, add_movie_to_list_dto.movie_id)
    )

    db.commit()

    return {"message": "Movie added successfully"}

def delete_user_list_service(
    list_id: int,
    user_id:int,
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    get_list_metadata_query = """
    SELECT * FROM user_lists WHERE list_id = %s AND user_id=%s
    """
    cursor.execute(get_list_metadata_query, (list_id, user_id,))
    metadata = cursor.fetchone()
    if not metadata:
        raise HTTPException("List not found")

    delete_movies_in_list_query = """
    DELETE
    FROM user_list_movies
    WHERE list_id = %s
    """
    delete_list_metadata_query = """
    DELETE
    FROM user_lists
    WHERE list_id = %s
    """
    cursor.execute(delete_movies_in_list_query, (list_id,))
    cursor.execute(delete_list_metadata_query, (list_id,))
    db.commit()
    return  {"message": "Successfully deleted list"}

def get_user_list_service(
    user_list_id: int,
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    get_list_metadata_query = """
    SELECT * FROM user_lists WHERE list_id = %s
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
            m.primaryTitle
        FROM user_lists ul
        JOIN user_list_movies ulm ON ul.list_id = ulm.list_id
        JOIN movies m ON ulm.tconst = m.tconst
        JOIN movie_genres mg ON mg.tconst = m.tconst
        JOIN genres g ON g.genreID = mg.genreID
        WHERE ul.list_id = %s
        ORDER BY g.genre, m.primaryTitle;
    """
    cursor.execute(get_list_movies_query, (user_list_id,))
    list_movies = cursor.fetchall()
    grouped_result = {}
    for movie in list_movies:
        genre = movie["genre"]
        movie_name = movie["primaryTitle"]
        if genre not in grouped_result:
            grouped_result[genre] = []
        grouped_result[genre].append(movie_name)
    
    result["movies"] = grouped_result
    return result