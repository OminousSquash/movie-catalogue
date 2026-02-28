from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class CreateUserListDTO(BaseModel):
    list_name: str
    list_note: str
    creator_user_id: str

