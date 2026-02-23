from collections import defaultdict
import pandas as pd
import csv
from typing import List


#raw_paths
link_table_path= "./datasets/ml-latest-small/links.csv"
ratings_table_path = "./datasets/personality-isf2018/ratings.csv"
personality_table_path = "./datasets/personality-isf2018/personality-data.csv"

#filtered_paths
filtered_movies_path = "./datasets/IMDb/filtered/movies.tsv"
filtered_link_path = "./datasets/ml-latest-small/filtered/links.csv"
filtered_ratings_path = "./datasets/personality-isf2018/filtered/ratings.csv"
filtered_personality_path = "./datasets/personality-isf2018/filtered/personality.csv"

import pandas as pd

def create_filtered_link_table():
    # Load data
    links = pd.read_csv(link_table_path)
    movies = pd.read_csv(filtered_movies_path, sep="\t")

    # Convert imdbId → tconst format
    links["imdbId"] = links["imdbId"].astype(str).str.zfill(7)
    links["tconst"] = "tt" + links["imdbId"]

    links = links[["movieId", "tconst"]]

    # Keep only relevant IMDb columns
    movies_subset = movies[["tconst"]]

    # Merge links with IMDb movies
    merged = links.merge(
        movies_subset,
        on="tconst",
        how="inner"  # only keep matches in filtered IMDb dataset
    )

    # Save filtered link table
    merged.to_csv(filtered_link_path, index=False)

    return merged


def create_filtered_ratings_table():
    # Load ratings
    ratings = pd.read_csv(ratings_table_path)
    ratings.columns = ratings.columns.str.strip()

    ratings = ratings.rename(columns={
        "movie_id": "movieId",
        "useri": "userId"
    })

    filtered_links = pd.read_csv(filtered_link_path)

    valid_movie_ids = set(filtered_links["movieId"])
    filtered_ratings = ratings[ratings["movieId"].isin(valid_movie_ids)]

    filtered_ratings = filtered_ratings.merge(
        filtered_links[["movieId", "tconst"]],
        on="movieId",
        how="inner"
    )

    filtered_ratings = filtered_ratings.drop(columns=["movieId"])

    filtered_ratings = filtered_ratings[
        ["userId", "tconst", "rating", "tstamp"]
    ]

    filtered_ratings.to_csv(
        filtered_ratings_path,
        index=False
    )

    return filtered_ratings


def create_filtered_personality_table():
    # Load personality + filtered ratings
    personality = pd.read_csv(personality_table_path)
    ratings = pd.read_csv(filtered_ratings_path)

    # Clean headers (your CSVs may have spaces)
    personality.columns = personality.columns.str.strip()
    ratings.columns = ratings.columns.str.strip()

    # Your personality file uses 'userid' (lowercase) based on your snippet
    # Standardise to match filtered_ratings which uses 'userId'
    personality = personality.rename(columns={"userid": "userId"})

    # Get the set of users that actually appear in filtered ratings
    valid_users = set(ratings["userId"].astype(str))

    # Filter to those users
    filtered_personality = personality[personality["userId"].astype(str).isin(valid_users)]

    # Select only the requested columns
    cols = [
        "userId",
        "openness",
        "agreeableness",
        "emotional_stability",
        "conscientiousness",
        "extraversion",
    ]
    filtered_personality = filtered_personality[cols]

    # Save
    filtered_personality.to_csv(filtered_personality_path, index=False)

    return filtered_personality

merged = create_filtered_link_table()
filtered_ratings = create_filtered_ratings_table()
filtered_personality = create_filtered_personality_table()
print(filtered_personality.head())
