import mysql.connector
from mysql.connector import MySQLConnection

def get_db() -> MySQLConnection:
    conn = mysql.connector.connect(
        host="db",
        user="appuser",
        password="apppass",
        database="moviedb"
    )
    try:
        yield conn
    finally:
        conn.close()
