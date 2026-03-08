from backend.security.auth_utils import verify_password
from backend.security.auth_utils import create_access_token
from backend.security.auth_utils import hash_password
from backend.DTOs.signup_dto import SignupDTO
from backend.DTOs.login_dto import LoginDTO
from mysql.connector import Error, MySQLConnection
from fastapi import HTTPException, status

def login_service(
    login_dto: LoginDTO,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary = True)
        app_username = login_dto.username
        
        username_exists_query = """
        SELECT * FROM app_users WHERE app_username = %s
        """

        cursor.execute(username_exists_query, (app_username,))

        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=400, detail="Username or Password incorrect")

        if not verify_password(login_dto.password, user["app_user_password_hash"]):
            raise HTTPException(status_code=401, detail="Username or Password incorrect")

        token = create_access_token(str(user["app_user_id"]))

        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log in"
        )

def signup_service(
    signup_dto: SignupDTO,
    db: MySQLConnection
):
    try:
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM app_users WHERE app_username = %s", (signup_dto.username,))
        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_pw = hash_password(signup_dto.password)

        cursor.execute(
            "INSERT INTO app_users (app_username, app_user_password_hash) VALUES (%s, %s)",
            (signup_dto.username, hashed_pw)
        )
        db.commit()

        app_user_id = cursor.lastrowid

        token = create_access_token(str(app_user_id))

        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )
