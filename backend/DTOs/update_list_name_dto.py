from pydantic import BaseModel

class UpdateListNameDTO(BaseModel):
    list_name: str