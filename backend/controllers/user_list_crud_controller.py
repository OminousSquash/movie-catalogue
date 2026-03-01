from fastapi import APIRouter, Query, Depends, FastAPI
from database.database import get_db
from backend.DTOs.create_user_list_dto import CreateUserListDTO
from backend.DTOs.update_list_name_dto import UpdateListNameDTO
from backend.DTOs.update_list_note_dto import UpdateListNoteDTO
from backend.DTOs.add_movie_to_list_dto import AddMovieToListDTO
from database.services.user_list_service import create_user_list_service
from database.services.user_list_service import delete_user_list_service
from database.services.user_list_service import get_user_list_service
from database.services.user_list_service import update_list_note_service
from database.services.user_list_service import update_list_name_service
from database.services.user_list_service import add_movie_to_list_service
from backend.security.dependencies import get_current_user

router = APIRouter(prefix="/user_list", tags=["user lists"])

@router.get("/{list_id}")
def get_user_list(
    list_id: int,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return get_user_list_service(user_list_id=list_id, user_id=user_id, db=db)

@router.post("/")
def create_user_list(
    create_user_list_dto: CreateUserListDTO,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return create_user_list_service(
        create_user_list_dto=create_user_list_dto,
        user_id=user_id,
        db=db
    )

@router.put("/list_note/{list_id}")
def update_list_note(
    list_id: int,
    update_list_note_dto: UpdateListNoteDTO,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return update_list_note_service(list_id=list_id, user_id=user_id, db=db, update_list_note_dto=update_list_note_dto)

@router.put("/list_name/{list_id}")
def update_list_name(
    list_id: int,
    update_list_name_dto: UpdateListNameDTO,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return update_list_name_service(list_id=list_id, 
                                    user_id=user_id, 
                                    db=db, 
                                    updated_list_name_dto=update_list_name_dto
                                    )

@router.delete("/{list_id}")
def delete_user_list(
    list_id: int,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return delete_user_list_service(list_id=list_id, user_id=user_id, db=db)


@router.post("/add_movie/{list_id}")
def add_movie_to_list(
    list_id: int,
    add_movie_to_list_dto: AddMovieToListDTO,
    user_id: int = Depends(get_current_user),
    db = Depends(get_db)
):
    return add_movie_to_list_service(
        user_id=user_id,
        list_id=list_id,
        add_movie_to_list_dto=add_movie_to_list_dto,
        db=db
    )
