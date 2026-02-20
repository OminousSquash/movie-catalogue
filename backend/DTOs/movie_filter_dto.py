from dataclasses import dataclass
from typing import Optional, List
from fastapi import Query

@dataclass
class MovieFilterDTO:
    title: Optional[str] = Query(default=None)
    start_year: Optional[int] = Query(default=None)
    end_year: Optional[int] = Query(default=None)
    min_rating: Optional[float] = Query(default=None)
    max_rating: Optional[float] = Query(default=None)
    min_runtime: Optional[int] = Query(default=None)
    max_runtime: Optional[int] = Query(default=None)
    min_votes: Optional[int] = Query(default=None)
    max_votes: Optional[int] = Query(default=None)
    genres: Optional[List[str]] = Query(default=None)
    tags: Optional[List[str]] = Query(default=None)