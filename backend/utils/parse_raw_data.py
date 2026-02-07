from collections import defaultdict
import pandas as pd
import csv
from typing import List

# urls
title_basics_path = "./datasets/IMDb/raw/title.basics.tsv"
title_ratings_path = "./datasets/IMDb/raw/title.ratings.tsv"
title_crew_path = "./datasets/IMDb/raw/title.crew.tsv"
title_principals_path = "./datasets/IMDb/raw/title.principals.tsv"
name_basics_path = "./datasets/IMDb/raw/name.basics.tsv"

filtered_movies_data_path = "./datasets/IMDb/filtered/movies.tsv"
filtered_genres_data_path = "./datasets/IMDb/filtered/genres.tsv"
filtered_movies_genres_data_path = "./datasets/IMDb/filtered/movies_genres.tsv"


# raw data
title_ratings_data = []
title_basics_data = defaultdict()
title_crew_data = defaultdict()
title_principals_data = defaultdict()
name_basics_data = defaultdict()

# filtered data

top_movie_ids = set()

def extract_relevant_data(rows: List[dict]):
    result = []
    print(rows[0].keys())
    for row in rows:
        movie_fields = ["tconst", "primaryTitle", "isAdult", "averageRating", "numVotes", "genres"] 
        movie = {k: row[k] for k in movie_fields}
        result.append(movie)
    return result

def load_principals_data():
    print("loading principals")
    with open(title_principals_path, newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter="\t")
        title_principal_fields = next(reader)
        print(title_principal_fields)
        for row in reader:
            zipped_data = dict(zip(title_principal_fields, row))
            if zipped_data["tconst"] not in title_principals_data:
                title_principals_data[zipped_data["tconst"]] = []
            title_principals_data[zipped_data["tconst"]].append(zipped_data)

def load_name_basics_data():
    print("loading name basics")
    with open(name_basics_path, newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter="\t")
        name_basics_fields = next(reader)
        print(name_basics_fields)
        for row in reader:
            zipped_data = dict(zip(name_basics_fields, row))
            if zipped_data["birthYear"] == "\\N":
                zipped_data["birthYear"] = -1
            else:
                zipped_data["birthYear"] = int(zipped_data["birthYear"])

            if (zipped_data["deathYear"] == "\\N"):
                zipped_data["deathYear"] = -1
            else:
                zipped_data["deathYear"] = int(zipped_data["deathYear"])
            name_basics_data[zipped_data["nconst"]] = zipped_data

def load_title_basics_data():
    print("loading title basics")
    global title_basics_fields, title_ratings_fields
    with open(title_basics_path, newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter="\t")
        title_basics_fields = next(reader)
        print(title_basics_fields)
        for row in reader:
            zipped_data = dict(zip(title_basics_fields, row))
            title_basics_data[zipped_data["tconst"]] = zipped_data


def load_title_ratings_data():
    print("loading title ratings")
    global title_basics_fields, title_ratings_fields
    with open(title_ratings_path, newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter="\t")
        title_ratings_fields = next(reader)
        print(title_ratings_fields)
        for row in reader:
            zipped_data = dict(zip(title_ratings_fields, row))
            zipped_data["averageRating"] = float(zipped_data["averageRating"])
            zipped_data["numVotes"] = int(zipped_data["numVotes"])
            zipped_data["ratingScore"] = zipped_data["averageRating"] * zipped_data["numVotes"]
            title_ratings_data.append(zipped_data) 


def load_data():
    load_title_basics_data()
    load_title_ratings_data()
    load_name_basics_data()
    load_principals_data()
    
def collect_top_rated_movies():
    global title_ratings_data, top_movie_ids

    title_ratings_data.sort(
        key=lambda x: (x["ratingScore"]),
        reverse=True
    )
    top_rated_movies = []
    print("Getting top rated")
    for i in range(len(title_ratings_data)):
        id = title_ratings_data[i]["tconst"]
        basics_data = title_basics_data[id]
        merged = title_ratings_data[i] | title_basics_data[id]
        if basics_data["titleType"] == "movie":
            top_movie_ids.add(id)
            top_rated_movies.append(merged)
        if len(top_rated_movies) == 10000:
            break
    result = extract_relevant_data(top_rated_movies)
    return result

def collect_contributor_information():
    global name_basics_data, top_movie_ids, title_principals_data
    filtered_contributors_id = set() 
    movie_contributors= []
    popular_works = []
    contributors = []
    for id in top_movie_ids:
        contributors_information = title_principals_data[id]
        for c_info in contributors_information:
            movie_contributors.append({
                "tconst": c_info["tconst"],
                "nconst": c_info["nconst"],
                "role": c_info["category"]
            })
            filtered_contributors_id.add(c_info["nconst"])
    for nconst in filtered_contributors_id:
        contribtor_info = name_basics_data[nconst].copy()
        contribtor_info.pop("primaryProfession", None)
        known_for_titles = []
        known_for_raw = contribtor_info.get("knownForTitles", "\\N")
        if known_for_raw != "\\N":
            for title_id in known_for_raw.split(","):
                if title_id in top_movie_ids:
                    known_for_titles.append(title_id)
        contribtor_info.pop("knownForTitles", None)
        for title_id in known_for_titles:
            popular_works.append({
                "nconst": nconst,
                "tconst": title_id
            })
        contributors.append(contribtor_info)
    return contributors, movie_contributors, popular_works

def write_to_tsv(rows, path):
    if not rows:
        print(f"No rows to write for {path}")
        return

    fieldnames = rows[0].keys()

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {path}")

def split_tables(rows: List[dict]):
    movies_fields = ["tconst", "primaryTitle", "isAdult", "averageRating", "numVotes"]

    movies = []
    genres_set = set()
    movies_genres = []

    for row in rows:
        movies.append({k: row[k] for k in movies_fields})

        for genre in row["genres"].split(","):
            genres_set.add(genre)

    genres = []
    genre_to_id = {}

    for i, genre in enumerate(sorted(genres_set)):
        genres.append({
            "genreId": i,
            "genre": genre
        })
        genre_to_id[genre] = i

    for row in rows:
        for genre in row["genres"].split(","):
            movies_genres.append({
                "tconst": row["tconst"],
                "genreId": genre_to_id[genre]
            })

    return movies, genres, movies_genres

load_data()
top_10k_movies = collect_top_rated_movies()
movies, genres, movies_genres = split_tables(top_10k_movies)
contributors, movie_contributors, popular_works = collect_contributor_information()
write_to_tsv(movies, filtered_movies_data_path)
write_to_tsv(genres, filtered_genres_data_path)
write_to_tsv(movies_genres, filtered_movies_genres_data_path)
write_to_tsv(contributors, "./datasets/IMDb/filtered/contributors.tsv")
write_to_tsv(movie_contributors, "./datasets/IMDb/filtered/movie_contributors.tsv")
write_to_tsv(popular_works, "./datasets/IMDb/filtered/popular_works.tsv")




