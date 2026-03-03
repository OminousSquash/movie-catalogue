from backend.security.auth_utils import verify_password
from backend.security.auth_utils import create_access_token
from backend.security.auth_utils import hash_password
from backend.DTOs.signup_dto import SignupDTO
from backend.DTOs.login_dto import LoginDTO
from mysql.connector import MySQLConnection
from fastapi import HTTPException

def login_service(
    login_dto: LoginDTO,
    db: MySQLConnection
):
    cursor = db.cursor(dictionary = True)
    username = login_dto.username
    
    username_exists_query = """
    SELECT * FROM user_credentials WHERE username = %s
    """

    cursor.execute(username_exists_query, (username,))

    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=400, detail="Username or Password incorrect")

    if not verify_password(login_dto.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Username or Password incorrect")

    token = create_access_token(str(user["user_id"]))

    return {"access_token": token, "token_type": "bearer"}

def signup_service(
    signup_dto: SignupDTO,
    db: MySQLConnection
):
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM user_credentials WHERE username = %s", (signup_dto.username,))
    existing_user = cursor.fetchone()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = hash_password(signup_dto.password)

    cursor.execute(
        "INSERT INTO user_credentials (username, password_hash) VALUES (%s, %s)",
        (signup_dto.username, hashed_pw)
    )
    db.commit()

    user_id = cursor.lastrowid

    token = create_access_token(str(user_id))

    return {"access_token": token, "token_type": "bearer"}