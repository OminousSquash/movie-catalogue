from pydantic import BaseModel, Field
from typing import Optional

class GenreRecommendDTO(BaseModel):
    openness: float = Field(..., ge=1, le=10)
    agreeableness: float = Field(..., ge=1, le=10)
    emotional_stability: float = Field(..., ge=1, le=10)
    conscientiousness: float = Field(..., ge=1, le=10)
    extraversion: float = Field(..., ge=1, le=10)
    top_n_genres: Optional[int] = Field(default=3, ge=1, le=23)