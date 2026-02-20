import requests
import json
import re
from dotenv import load_dotenv

load_dotenv()

poster_cache: dict = {}
awards_cache: dict = {}

class imdbScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        })

    def get_poster_path(self, imdb_id):
        if imdb_id in poster_cache:
            return poster_cache[imdb_id]

        url = f"https://www.imdb.com/title/{imdb_id}/"

        try:
            response = self.session.get(url, timeout=5)
            if response.status_code != 200:
                print(f"Error fetching IMDb page: {response.status_code}")
                poster_cache[imdb_id] = None
                return None

            match = re.search(
                r'<meta\s+property=["\']og:image["\']\s+content=["\'](https://[^"\']+)["\']',
                response.text
            )
            if match:
                poster_url = match.group(1)
                poster_url = re.sub(r'\._V1_.*?\.jpg', '._V1_SX500.jpg', poster_url)
                poster_cache[imdb_id] = poster_url 
                return poster_url
            else:
                print("No poster found in page source.")
                poster_cache[imdb_id] = None
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
        if imdb_id in awards_cache:
            return awards_cache[imdb_id]

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
                        recipients = [r.get('text') for r in sub_list if r.get('text')]

                        parsed_awards.append({
                            "event": event_name,
                            "type": f"{item.get('rowTitle', '')} {item.get('rowSubTitle', '')}".strip(),
                            "award": award_name,
                            "all_recipients": recipients
                        })

                awards_cache[imdb_id] = parsed_awards
                return parsed_awards
            else:
                print("Could not find awards data in page source.")
                return None

        except Exception as e:
            print(f"Failed to parse awards: {e}")
            return None