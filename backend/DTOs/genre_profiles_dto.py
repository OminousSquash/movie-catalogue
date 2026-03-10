from pydantic import BaseModel, Field
from typing import Optional

class GenreProfilesDTO(BaseModel):
    genre: Optional[str] = None
    minimum_no_users: Optional[int] = Field(default=200, ge=1)