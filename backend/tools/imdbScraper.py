import requests
import json
import re
import os
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



# scraper = imdbScraper()
# awards = scraper.get_awards("tt0111161")
# poster = scraper.get_poster_path("tt0111161")
# ratings = scraper.get_rating("tt0111161")
# print(awards)
# print(f"Poster Path: https://image.tmdb.org/t/p/original{poster}")
# for ratingData in ratings:
#     print(f"{ratingData["rating"]} star : {ratingData["voteCount"]}")