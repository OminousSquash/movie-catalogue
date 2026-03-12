from pydantic import BaseModel

class StorePersonalityDTO(BaseModel):
    openness: int
    agreeableness: int
    emotional_stability: int
    conscientiousness: int
    extraversion: int