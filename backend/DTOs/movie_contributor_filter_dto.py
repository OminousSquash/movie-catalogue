from dataclasses import dataclass
from typing import Optional, List
from fastapi import Query

@dataclass
class MovieContributorFilterDTO:
    actors: Optional[List[str]] = Query(default=None)
    directors: Optional[List[str]] = Query(default=None)
    writers: Optional[List[str]] = Query(default=None)