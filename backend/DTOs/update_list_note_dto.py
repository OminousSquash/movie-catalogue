from pydantic import BaseModel

class UpdateListNoteDTO(BaseModel):
    new_list_note: str