from backend.DTOs.movie_contributor_filter_dto import MovieContributorFilterDTO
from backend.DTOs.movie_filter_dto import MovieFilterDTO


class MovieSearchFilterDTO(MovieFilterDTO, MovieContributorFilterDTO):
    pass
