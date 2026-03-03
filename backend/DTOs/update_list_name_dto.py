from pydantic import BaseModel

class UpdateListNameDTO(BaseModel):
    new_list_name: str