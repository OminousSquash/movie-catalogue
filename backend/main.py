from fastapi import FastAPI
import mysql.connector
import os

app = FastAPI()


def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "db"),
        user=os.getenv("DB_USER", "appuser"),
        password=os.getenv("DB_PASSWORD", "apppass"),
        database=os.getenv("DB_NAME", "appdb"),
    )

@app.get("/")
def home():
    return {"message": "API is working"}

@app.get("/movies")
def get_movies():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, title, year FROM movies")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

@app.post("/movies/{title}/{year}")
def add_movie(title: str, year: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO movies (title, year) VALUES (%s, %s)",
        (title, year),
    )
    db.commit()
    cursor.close()
    db.close()
    return {"status": "added"}