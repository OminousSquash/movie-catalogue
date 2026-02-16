from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class GenreContributorTrendAnalysisDTO(BaseModel):
    genres: Optional[List[str]] = None
    last_decade: bool = False