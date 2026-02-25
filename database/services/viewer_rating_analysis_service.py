from mysql.connector import MySQLConnection
from backend.DTOs.genre_contributor_trend_analysis_dto import GenreContributorTrendAnalysisDTO

def get_rating_harshness_service(db:MySQLConnection):
    cursor = db.cursor(dictionary = True)
    query = """
    SELECT 
    CASE 
        WHEN avg_rating <= 2.5 THEN 'Harsh'
        WHEN avg_rating >= 4.0 THEN 'Generous'
        ELSE 'Moderate'
    END AS rater_type,
    COUNT(*) AS num_users
    FROM (
        SELECT user_id, AVG(rating) AS avg_rating
        FROM user_ratings
        GROUP BY user_id
    ) AS user_avgs
    GROUP BY rater_type; 
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_low_rating_genres_service(db:MySQLConnection):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT 
        genre,
        COUNT(*) AS num_users_with_low_preference
    FROM (
        SELECT 
            ur.user_id,
            g.genre,
            AVG(ur.rating) AS avg_genre_rating,
            SUM(ur.rating <= 2) / COUNT(*) AS low_ratio,
            COUNT(*) AS ratings_in_genre
        FROM user_ratings ur
        JOIN movie_genres mg ON ur.tconst = mg.tconst
        JOIN genres g ON g.genreID = mg.genreID
        GROUP BY ur.user_id, g.genre
    ) u
    WHERE low_ratio > 0.5
    GROUP BY genre
    """

    cursor.execute(query)
    return cursor.fetchall()

import pandas as pd

def get_correlation_matrix_service(db: MySQLConnection):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT
        ur.user_id,
        g.genre,
        AVG(ur.rating) AS avg_genre_rating
    FROM user_ratings ur
    JOIN movie_genres mg ON ur.tconst = mg.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY ur.user_id, g.genre
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    df = pd.DataFrame(rows)

    user_genre_matrix = df.pivot_table(
        index="user_id",
        columns="genre",
        values="avg_genre_rating"
    )

    correlation_matrix = user_genre_matrix.corr(method="pearson")

    return correlation_matrix.to_dict()


from sklearn.cluster import KMeans

def get_user_segments_service(db: MySQLConnection, n_clusters: int = 5):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT ur.user_id, g.genre, AVG(ur.rating) AS avg_genre_rating
    FROM user_ratings ur
    JOIN movie_genres mg ON ur.tconst = mg.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY ur.user_id, g.genre
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    df = pd.DataFrame(rows)
    user_genre_matrix = df.pivot_table(index="user_id", columns="genre", values="avg_genre_rating").fillna(0)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(user_genre_matrix)

    return [{"user_id": uid, "cluster": int(c)} for uid, c in zip(user_genre_matrix.index, clusters)]

def get_cluster_summary_service(db: MySQLConnection, n_clusters: int = 5):
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT ur.user_id, g.genre, AVG(ur.rating) AS avg_genre_rating
    FROM user_ratings ur
    JOIN movie_genres mg ON ur.tconst = mg.tconst
    JOIN genres g ON g.genreID = mg.genreID
    GROUP BY ur.user_id, g.genre
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    df = pd.DataFrame(rows)
    user_genre_matrix = df.pivot_table(
        index="user_id",
        columns="genre",
        values="avg_genre_rating"
    ).fillna(0)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    user_genre_matrix["cluster"] = kmeans.fit_predict(user_genre_matrix)

    cluster_summary = {}

    for cluster_id in range(n_clusters):
        cluster_data = user_genre_matrix[user_genre_matrix["cluster"] == cluster_id]
        genre_means = cluster_data.drop(columns=["cluster"]).mean().sort_values(ascending=False)

        cluster_summary[f"cluster_{cluster_id}"] = {
            "num_users": len(cluster_data),
            "top_genres": genre_means.head(3).index.tolist(),
            "avg_rating_overall": round(cluster_data.drop(columns=["cluster"]).values.mean(), 2)
        }

    return cluster_summary

def get_conditional_low_rating_service(db: MySQLConnection, genre_a: str, genre_b: str):
    cursor = db.cursor(dictionary=True)

    query = """
    WITH user_genre_stats AS (
        SELECT 
            ur.user_id,
            g.genre,
            SUM(ur.rating <= 2) / COUNT(*) AS low_ratio
        FROM user_ratings ur
        JOIN movie_genres mg ON ur.tconst = mg.tconst
        JOIN genres g ON g.genreID = mg.genreID
        GROUP BY ur.user_id, g.genre
    )
    SELECT
        COUNT(DISTINCT a.user_id) AS users_low_in_a,
        COUNT(DISTINCT b.user_id) AS users_low_in_b_given_a
    FROM user_genre_stats a
    LEFT JOIN user_genre_stats b
        ON a.user_id = b.user_id AND b.genre = %s AND b.low_ratio > 0.5
    WHERE a.genre = %s AND a.low_ratio > 0.5
    """

    cursor.execute(query, (genre_b, genre_a))
    result = cursor.fetchone()

    if result["users_low_in_a"] == 0:
        probability = 0
    else:
        probability = result["users_low_in_b_given_a"] / result["users_low_in_a"]

    return {
        "genre_a": genre_a,
        "genre_b": genre_b,
        "probability": round(probability, 3),
        "sample_size": result["users_low_in_a"]
    }