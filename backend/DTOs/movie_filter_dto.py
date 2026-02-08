from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class MovieFilterDTO(BaseModel):
    title: Optional[str] = None
    start_year : Optional[int] = None
    end_year : Optional[int] = None
    min_rating : Optional[float] = None
    max_rating : Optional[float] = None
    genres : Optional[List[str]] = None
    min_votes : Optional[int] = None
    max_votes : Optional[int] = None
    min_runtime : Optional[int] = None
    max_runtime : Optional[int] = None
