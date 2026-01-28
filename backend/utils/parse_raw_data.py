from collections import defaultdict
import pandas as pd
import csv

title_basics_path = "./datasets/IMDb/raw/title.basics.tsv"
title_ratings_path = "./datasets/IMDb/raw/title.ratings.tsv"

title_basics_fields = []
title_basics_data = defaultdict()
title_ratings_fields = []
title_ratings_data = []
top_rated_movies = []

def load_data():
    global title_basics_fields, title_ratings_fields

    with open(title_basics_path, newline="", encoding="utf-8") as file:
        reader = csv.reader(file, delimiter="\t")
        title_basics_fields = next(reader)
        print(title_basics_fields)
        for row in reader:
            zipped_data = dict(zip(title_basics_fields, row))
            title_basics_data[zipped_data["tconst"]] = zipped_data

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

def collect_top_rated_movies():
    global title_ratings_data, top_rated_movies

    title_ratings_data.sort(
        key=lambda x: (x["ratingScore"]),
        reverse=True
    )
    for i in range(len(title_ratings_data)):
        id = title_ratings_data[i]["tconst"]
        basics_data = title_basics_data[id]
        if basics_data["titleType"] == "movie":
            top_rated_movies.append(basics_data)
        if len(top_rated_movies) == 10000:
            break

load_data()
collect_top_rated_movies()
