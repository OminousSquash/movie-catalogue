from pydantic import BaseModel, Field

class UpdateAppUserDTO(BaseModel):
    app_username: str
    openness: int
    agreeableness: int
    emotional_stability: int
    conscientiousness: int
    extraversion: int