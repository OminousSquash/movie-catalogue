from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class SignupDTO(BaseModel):
    username: str
    password: str
