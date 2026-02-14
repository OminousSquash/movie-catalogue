from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class MovieContributorFilterDTO(BaseModel):
    actors:Optional[List[str]] = None
    directors : Optional[List[str]] = None
    writers : Optional[List[str]] = None