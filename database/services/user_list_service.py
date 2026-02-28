from mysql.connector import MySQLConnection
from backend.DTOs.create_user_list_dto import CreateUserListDTO

def create_user_list_service(
    create_user_list_dto: CreateUserListDTO,
    db: MySQLConnection
):
    return

def update_user_list_service(
    user_list_id: str,
    db: MySQLConnection
):
    return

def delete_user_list_service(
    user_list_id:str,
    db: MySQLConnection
):
    return 

def get_user_list_service(
    user_list_id: str,
    db: MySQLConnection
):
    return

