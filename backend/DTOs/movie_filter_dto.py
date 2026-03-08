from pydantic import BaseModel
from typing import Optional, List
from typing import Literal

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
    tags: Optional[List[str]] = None
    has_oscar: Optional[bool] = None
    oscar_year: Optional[int] = None
    oscar_status: Optional[Literal["Winner", "Nominee"]] = None
    oscar_awards: Optional[List[str]] = None
