from pydantic import BaseModel
from typing import Optional, List

class PersonalityCorrelationDTO(BaseModel):
    personality_or_genre_a : Optional[str] = None
    personality_or_genre_b : Optional[str] = None