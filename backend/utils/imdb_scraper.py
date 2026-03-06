import requests
import json
import re
import os
import csv
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class imdbScraper:
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


if __name__ == "__main__":
    scraper = imdbScraper()
    print(scraper.download_filtered_movie_posters())
