from pydantic import BaseModel, field_validator
from typing import Optional, List

class MovieContributorFilterDTO(BaseModel):
    actors: Optional[List[str]] = None
    directors: Optional[List[str]] = None
    writers: Optional[List[str]] = None

    @staticmethod
    def _normalize_people(value):
        if value is None:
            return None

        raw_items = value if isinstance(value, list) else [value]
        normalized = []
        for item in raw_items:
            if item is None:
                continue
            parts = str(item).split(",")
            for part in parts:
                cleaned = part.strip()
                if cleaned:
                    normalized.append(cleaned)
        return normalized

    @field_validator("actors", "directors", "writers", mode="before")
    @classmethod
    def normalize_contributor_lists(cls, value):
        return cls._normalize_people(value)
