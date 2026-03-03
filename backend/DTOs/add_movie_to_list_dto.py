from pydantic import BaseModel

class AddMovieToListDTO(BaseModel):
    movie_id: str