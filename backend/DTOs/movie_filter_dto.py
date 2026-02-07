from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class MovieFilterDTO(BaseModel):
    title: Optional[str] = None
    release_from : Optional[date] = None
    release_to : Optional[date] = None
    min_rating : Optional[float] = None
    max_rating : Optional[float] = None
    genres : Optional[List[str]] = None
    min_votes : Optional[int] = None
    min_runtime : Optional[int] = None
    max_runtime : Optional[int] = None
