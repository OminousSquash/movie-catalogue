import requests
import json
import re
import os
import csv
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from pprint import pprint
from typing import Dict, List, Optional, Set, Tuple
from dotenv import load_dotenv

load_dotenv()

class ImdbScraper:
    def __init__(self):
        self.READ_ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")
        if not self.READ_ACCESS_TOKEN:
            raise ValueError("TMDB_ACCESS_TOKEN not set in .env")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        })

    def get_poster_path(self, imdb_id):
        url = f"https://api.themoviedb.org/3/find/{imdb_id}?external_source=imdb_id"
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {self.READ_ACCESS_TOKEN}" # Use self to access class variable
        }

        try:
            # Using the class session here too
            response = self.session.get(url, headers=headers)
            response.raise_for_status() 
            data = response.json()

            if data.get('movie_results'):
                movie = data['movie_results'][0]
                return movie.get('poster_path')
            else:
                print("No movie found.")
                return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching poster: {e}")
            return None

    def get_rating(self, imdb_id):
        url = f"https://www.imdb.com/title/{imdb_id}/ratings/"

        try:
            response = self.session.get(url)
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                return None

            pattern = r'"histogramData":\s*(\{.*?"histogramValues":\[.*?\]\})'
            match = re.search(pattern, response.text)

            if match:
                raw_json_str = match.group(1)
                histogram_data = json.loads(raw_json_str)
                return histogram_data.get('histogramValues', [])
            else:
                print("Could not find the JSON block in the page source.")
                return None
        except Exception as e:
            print(f"Failed to parse rating: {e}")
            return None
        
    def get_awards(self, imdb_id):
        url = f"https://www.imdb.com/title/{imdb_id}/awards/"
        
        try:
            response = self.session.get(url)
            if response.status_code != 200:
                return None

            pattern = r'"categories":\s*(\[.*?\])\s*\}\s*,\s*"requestContext"'
            match = re.search(pattern, response.text, re.DOTALL)

            if match:
                awards_data = json.loads(match.group(1))
                parsed_awards = []

                for category in awards_data:
                    event_name = category.get('name')
                    if event_name != 'Academy Awards, USA':
                        continue
                    items = category.get('section', {}).get('items', [])
                    for item in items:
                        award_list = item.get('listContent', [])
                        award_name = award_list[0].get('text') if award_list else "Unknown Award"
                        sub_list = item.get('subListContent', [])
                        recipients = [r.get('text') for r in sub_list if r.get('text')] # Currently, the recipient will be empty if the movie itself receives an award and not a person

                        parsed_awards.append({
                            "event": event_name,
                            "type": f"{item.get('rowTitle', '')} {item.get('rowSubTitle', '')}".strip(),
                            "award": award_name,
                            "all_recipients": recipients
                        })
                return parsed_awards
            else:
                print("Could not find awards data in page source.")
                return None

        except Exception as e:
            print(f"Failed to parse awards: {e}")
            return None

    def download_filtered_movie_posters(
        self,
        movies_tsv_path: str = "datasets/IMDb/filtered/movies.tsv",
        output_dir: str = "datasets/movie-posters",
        max_workers: int = 16,
    ):
        project_root = Path(__file__).resolve().parents[2]

        movies_path = Path(movies_tsv_path)
        if not movies_path.is_absolute():
            movies_path = project_root / movies_path

        posters_dir = Path(output_dir)
        if not posters_dir.is_absolute():
            posters_dir = project_root / posters_dir
        posters_dir.mkdir(parents=True, exist_ok=True)

        with movies_path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            imdb_ids = [row["tconst"] for row in reader if row.get("tconst")]

        if not imdb_ids:
            return {"total": 0, "downloaded": 0, "skipped": 0, "failed": 0}

        def detect_extension(content_type: str) -> str:
            if not content_type:
                return ".jpg"
            content_type = content_type.lower()
            if "png" in content_type:
                return ".png"
            if "webp" in content_type:
                return ".webp"
            return ".jpg"

        def download_one(imdb_id: str) -> str:
            existing_files = list(posters_dir.glob(f"{imdb_id}.*"))
            if any(file.stat().st_size > 0 for file in existing_files):
                return "skipped"

            poster_path = self.get_poster_path(imdb_id)
            if not poster_path:
                return "failed"

            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            try:
                response = self.session.get(poster_url, timeout=10)
                if response.status_code != 200 or not response.content:
                    return "failed"
                extension = detect_extension(response.headers.get("Content-Type", ""))
                output_path = posters_dir / f"{imdb_id}{extension}"
                output_path.write_bytes(response.content)
                return "downloaded"
            except requests.exceptions.RequestException:
                return "failed"

        downloaded = 0
        skipped = 0
        failed = 0

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for result in executor.map(download_one, imdb_ids):
                if result == "downloaded":
                    downloaded += 1
                elif result == "skipped":
                    skipped += 1
                else:
                    failed += 1

        return {
            "total": len(imdb_ids),
            "downloaded": downloaded,
            "skipped": skipped,
            "failed": failed,
        }

    def _load_contributor_maps(
        self,
        contributors_tsv_path: str,
    ) -> Tuple[Dict[str, str], Dict[str, Set[str]]]:
        nconst_to_name: Dict[str, str] = {}
        name_to_nconsts: Dict[str, Set[str]] = {}

        with open(contributors_tsv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                nconst = (row.get("nconst") or "").strip()
                primary_name = (row.get("primaryName") or "").strip()
                if not nconst or not primary_name:
                    continue
                nconst_to_name[nconst] = primary_name
                if primary_name not in name_to_nconsts:
                    name_to_nconsts[primary_name] = set()
                name_to_nconsts[primary_name].add(nconst)

        return nconst_to_name, name_to_nconsts

    def _extract_oscar_year_status(self, type_text: str) -> Tuple[Optional[int], Optional[str]]:
        match = re.match(r"^\s*(\d{4})\s+(Winner|Nominee)\b", type_text or "")
        if not match:
            return None, None
        return int(match.group(1)), match.group(2)

    def _resolve_recipient_nconst(
        self,
        recipient_name: str,
        name_to_nconsts: Dict[str, Set[str]],
    ) -> Optional[str]:
        candidates = name_to_nconsts.get(recipient_name)
        if not candidates:
            return None

        return sorted(candidates)[0]

    def export_oscar_movies_csv(
        self,
        movies_tsv_path: str = "../../datasets/IMDb/filtered/movies.tsv",
        contributors_tsv_path: str = "../../datasets/IMDb/filtered/contributors.tsv",
        output_csv_path: str = "../../datasets/IMDb/filtered/oscar_movies.csv",
        test_tconst: Optional[str] = None,
    ):
        output_dir = os.path.dirname(output_csv_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        nconst_to_name, name_to_nconsts = self._load_contributor_maps(contributors_tsv_path)

        with open(movies_tsv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            imdb_ids = [row["tconst"] for row in reader if row.get("tconst")]
        if test_tconst:
            imdb_ids = [test_tconst]

        output_rows: List[Dict[str, str]] = []

        for imdb_id in imdb_ids:
            awards = self.get_awards(imdb_id)
            if not awards:
                continue

            for award in awards:
                year, status = self._extract_oscar_year_status(award.get("type", ""))
                if year is None or status is None:
                    continue

                award_name = (award.get("award") or "").strip()
                recipients = award.get("all_recipients") or []

                # If no people are listed, still write one row for the movie-level nomination/win.
                if not recipients:
                    output_rows.append({
                        "tconst": imdb_id,
                        "year": str(year),
                        "award_name": award_name,
                        "status": status,
                        "recipient_name": "\\N",
                        "recipient_nconst": "\\N",
                    })
                    continue

                for recipient in recipients:
                    recipient_name = (recipient or "").strip()
                    if not recipient_name:
                        continue

                    recipient_nconst = self._resolve_recipient_nconst(
                        recipient_name=recipient_name,
                        name_to_nconsts=name_to_nconsts,
                    )

                    if recipient_nconst and recipient_nconst not in nconst_to_name:
                        recipient_nconst = None

                    output_rows.append({
                        "tconst": imdb_id,
                        "year": str(year),
                        "award_name": award_name,
                        "status": status,
                        "recipient_name": recipient_name,
                        "recipient_nconst": recipient_nconst or "\\N",
                    })

        with open(output_csv_path, "w", encoding="utf-8", newline="") as f:
            fieldnames = [
                "tconst",
                "year",
                "award_name",
                "status",
                "recipient_name",
                "recipient_nconst",
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(output_rows)

        return {
            "output_path": output_csv_path,
            "rows": len(output_rows),
            "movies_scanned": len(imdb_ids),
        }

    def export_movie_tags(
        self,
        tags_csv_path: str = "../../datasets/ml-latest-small/tags.csv",
        links_csv_path: str = "../../datasets/ml-latest-small/links.csv",
        movies_tsv_path: str = "../../datasets/IMDb/filtered/movies.tsv",
        output_tags_csv_path: str = "../../datasets/ml-latest-small/filtered/tags.csv",
        output_movie_tags_csv_path: str = "../../datasets/ml-latest-small/filtered/movie_tags.csv",
    ):
        output_tags_dir = os.path.dirname(output_tags_csv_path)
        if output_tags_dir:
            os.makedirs(output_tags_dir, exist_ok=True)

        output_movie_tags_dir = os.path.dirname(output_movie_tags_csv_path)
        if output_movie_tags_dir:
            os.makedirs(output_movie_tags_dir, exist_ok=True)

        valid_movie_tconsts: Set[str] = set()
        with open(movies_tsv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                tconst = (row.get("tconst") or "").strip()
                if tconst:
                    valid_movie_tconsts.add(tconst)

        movie_id_to_tconst: Dict[str, str] = {}
        with open(links_csv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                movie_id = (row.get("movieId") or "").strip()
                imdb_id_raw = (row.get("imdbId") or "").strip()
                if not movie_id or not imdb_id_raw:
                    continue

                imdb_digits = re.sub(r"\D", "", imdb_id_raw)
                if not imdb_digits:
                    continue

                movie_id_to_tconst[movie_id] = f"tt{imdb_digits.zfill(7)}"

        tag_name_to_id: Dict[str, int] = {}
        tags_rows: List[Dict[str, str]] = []
        movie_tags_rows: List[Dict[str, str]] = []
        seen_movie_tag_pairs: Set[Tuple[str, int]] = set()
        skipped_missing_link = 0
        skipped_missing_movie = 0

        with open(tags_csv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                movie_id = (row.get("movieId") or "").strip()
                raw_tag_name = (row.get("tag") or "").strip()
                tag_name = raw_tag_name
                tag_name = tag_name.replace("\r", "").replace("\n", " ").strip()
                if raw_tag_name in {'"""artsy"""', '"artsy"'}:
                    continue
                while '""' in tag_name:
                    tag_name = tag_name.replace('""', '"')
                while len(tag_name) >= 2 and tag_name[0] == '"' and tag_name[-1] == '"':
                    tag_name = tag_name[1:-1].strip()

                if not movie_id or not tag_name:
                    continue

                tconst = movie_id_to_tconst.get(movie_id)
                if not tconst:
                    skipped_missing_link += 1
                    continue
                if tconst not in valid_movie_tconsts:
                    skipped_missing_movie += 1
                    continue

                if tag_name not in tag_name_to_id:
                    tag_id = len(tag_name_to_id) + 1
                    tag_name_to_id[tag_name] = tag_id
                    tags_rows.append({
                        "tag_id": str(tag_id),
                        "tag_name": tag_name,
                    })

                tag_id = tag_name_to_id[tag_name]
                pair = (tconst, tag_id)
                if pair in seen_movie_tag_pairs:
                    continue

                seen_movie_tag_pairs.add(pair)
                movie_tags_rows.append({
                    "tconst": tconst,
                    "tag_id": str(tag_id),
                })

        with open(output_tags_csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["tag_id", "tag_name"])
            writer.writeheader()
            writer.writerows(tags_rows)

        with open(output_movie_tags_csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["tconst", "tag_id"])
            writer.writeheader()
            writer.writerows(movie_tags_rows)

        return {
            "tags_output_path": output_tags_csv_path,
            "movie_tags_output_path": output_movie_tags_csv_path,
            "tags_rows": len(tags_rows),
            "movie_tags_rows": len(movie_tags_rows),
            "skipped_missing_link_rows": skipped_missing_link,
            "skipped_missing_movie_rows": skipped_missing_movie,
        }

if __name__ == "__main__":
    scraper = ImdbScraper()
    result = scraper.download_filtered_movie_posters()
    pprint(result)
