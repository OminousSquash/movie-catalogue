from mysql.connector import Error, MySQLConnection, connect
from fastapi import HTTPException, status
import heapq
import math
from collections import defaultdict
import csv
import os
from dotenv import load_dotenv

load_dotenv()
RECENT_MOVIE_PATH = "recent_movies.tsv"
OUTPUT_PATH = "recent_predicted_movies.tsv"


class RatingPrediction:
    def __init__(self, db: MySQLConnection):
        self.movie_dict = self.load_movies(db)
        (
            self.genre_index,
            self.actor_index,
            self.director_index,
            self.writer_index
        ) = self.build_indexes()

    def load_movies(self, db: MySQLConnection):
        try:
            movies = {}
            cursor = db.cursor(dictionary=True)
            cursor.execute("""
                SELECT
                    m.tconst,
                    m.is_adult,
                    m.runtime_minutes,
                    m.average_rating,
                    g.genre_id,
                    c.nconst,
                    c.role
                FROM movies m
                LEFT JOIN movie_genres g
                    ON m.tconst = g.tconst
                LEFT JOIN movie_contributors c
                    ON m.tconst = c.tconst
            """)

            for row in cursor:
                tconst = row["tconst"]
                if tconst not in movies:
                    movies[tconst] = {
                        "is_adult": row["is_adult"],
                        "runtime_minutes": row["runtime_minutes"],
                        "genres": set(),
                        "actors": set(),
                        "directors": set(),
                        "writers": set(),
                        "rating": float(row["average_rating"]),
                    }
                if row["genre_id"]:
                    movies[tconst]["genres"].add(row["genre_id"])
                    
                role = row["role"]
                person = row["nconst"]
                if role and person:
                    role = role.lower()
                    if role in ("actor", "actress"):
                        movies[tconst]["actors"].add(person)
                    elif "director" in role:
                        movies[tconst]["directors"].add(person)
                    elif "writer" in role:
                        movies[tconst]["writers"].add(person)

            return movies

        except HTTPException:
            raise
        except Error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load movie information"
            )


    def build_indexes(self):
        genre_index = defaultdict(set)
        actor_index = defaultdict(set)
        director_index = defaultdict(set)
        writer_index = defaultdict(set)
        for tconst, movie in self.movie_dict.items():
            for genre in movie["genres"]:
                genre_index[genre].add(tconst)
            for a in movie["actors"]:
                actor_index[a].add(tconst)
            for d in movie["directors"]:
                director_index[d].add(tconst)
            for w in movie["writers"]:
                writer_index[w].add(tconst)

        return genre_index, actor_index, director_index, writer_index


    def get_candidates(self, target_data: dict):
        candidates = set()

        # same genre
        for g in target_data["genres"]:
            candidates |= self.genre_index.get(g, set())

        # same actors
        for a in target_data["actors"]:
            candidates |= self.actor_index.get(a, set())

        # same directors
        for d in target_data["directors"]:
            candidates |= self.director_index.get(d, set())
        
        # same writer
        for w in target_data["writers"]:
            candidates |= self.writer_index.get(w, set())

        return candidates


    def similarity(self, target_data: dict, suggested_data: dict):
        GENRE_WEIGHT = 10
        RUNTIME_WEIGHT = 3
        ACTOR_WEIGHT = 2
        DIRECTOR_WEIGHT = 5
        WRITER_WEIGHT = 5
        score = 0
        if target_data["is_adult"] == suggested_data["is_adult"]:
            score += 1

        target_runtime = target_data["runtime_minutes"] or 0
        suggested_runtime = suggested_data["runtime_minutes"] or 0
        runtime_diff = abs(target_runtime - suggested_runtime)

        if runtime_diff <= 20:
            runtime_score = RUNTIME_WEIGHT
        elif runtime_diff >= 60:
            runtime_score = 0
        else:
            runtime_score = RUNTIME_WEIGHT * (1 - (runtime_diff - 20) / 40)

        shared_genres = len(target_data["genres"] & suggested_data["genres"])
        score += shared_genres * GENRE_WEIGHT
        score += runtime_score
        score += len(target_data["actors"] & suggested_data["actors"]) * ACTOR_WEIGHT
        score += len(target_data["directors"] & suggested_data["directors"]) * DIRECTOR_WEIGHT
        score += len(target_data["writers"] & suggested_data["writers"]) * WRITER_WEIGHT

        return score


    def predict_rating(self, original_tconst: str, k=100):
        target_data = self.movie_dict.get(original_tconst)
        if not target_data:
            return (None, None)
        candidates = self.get_candidates(target_data=target_data)

        scores = []

        for tconst in candidates:
            if tconst == original_tconst:
                continue

            suggested_data = self.movie_dict[tconst]
            similarity_score = self.similarity(target_data, suggested_data)

            if similarity_score >= 10: # At least have the same genre or equivalent in other weights
                scores.append((similarity_score, suggested_data["rating"]))

        top_k = heapq.nlargest(k, scores)

        if not top_k:
            return (None, None)

        weighted_sum = sum(score * rating for score, rating in top_k)
        weight_total = sum(score for score, _ in top_k)
        
        predicted_rating = weighted_sum / weight_total

        variance_sum = sum(score * ((rating - predicted_rating) ** 2) for score, rating in top_k)
        weighted_variance = variance_sum / weight_total
        uncertainty = math.sqrt(weighted_variance)

        return (predicted_rating, uncertainty)

    def predict_from_tsv(self, input_path: str, output_path: str):
        results = []
        with open(input_path, "r") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                tconst = row["tconst"]
                predicted_rating, uncertainty = self.predict_rating(tconst)
                results.append({
                    "tconst": row["tconst"],
                    "predicted_rating": round(predicted_rating, 1) if predicted_rating is not None else None,
                    "prediction_uncertainty": round(uncertainty, 2) if uncertainty is not None else None,
                })

        with open(output_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys(), delimiter="\t")
            writer.writeheader()
            writer.writerows(results)

        print(f"Done! Results saved to {output_path}")



db = connect(
    host="localhost",
    port=3306,
    user="root",
    password=os.getenv("DATABASE_PASSWORD"),
    database="moviedb"
)

rp = RatingPrediction(db)
rp.predict_from_tsv(RECENT_MOVIE_PATH, OUTPUT_PATH)