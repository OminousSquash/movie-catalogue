import api from "./api";

export const getGenres = async () => {
  const response = await api.get("/movies/genres");
  return response.data;
};

export const searchMovies = async (filters, page = 1) => {
  const params = { page };
  if (filters.title) params.title = filters.title;
  if (filters.start_year !== undefined) params.start_year = filters.start_year;
  if (filters.end_year !== undefined) params.end_year = filters.end_year;
  if (filters.min_rating !== undefined) params.min_rating = filters.min_rating;
  if (filters.max_rating !== undefined) params.max_rating = filters.max_rating;
  if (filters.min_runtime !== undefined) params.min_runtime = filters.min_runtime;
  if (filters.max_runtime !== undefined) params.max_runtime = filters.max_runtime;
  if (filters.min_votes !== undefined) params.min_votes = filters.min_votes;
  if (filters.max_votes !== undefined) params.max_votes = filters.max_votes;

  if (filters.genres?.length) params.genres = filters.genres;
  if (filters.tags?.length) params.tags = filters.tags;
  if (filters.actors?.length) params.actors = filters.actors;
  if (filters.directors?.length) params.directors = filters.directors;
  if (filters.writers?.length) params.writers = filters.writers;

  const response = await api.get("/movies/", {
    params,
    paramsSerializer: (p) => {
      const parts = [];
      for (const [key, value] of Object.entries(p)) {
        if (Array.isArray(value)) {
          value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          parts.push(`${key}=${encodeURIComponent(value)}`);
        }
      }
      return parts.join("&");
    },
  });

  return response.data;
};

export const getRecentMovies = async () => {
  const response = await api.get("/movies/recent");
  return response.data;
};

export const getMoviePoster = async (tconst) => {
  const response = await api.get(`/movies/${tconst}/poster`);
  return response.data.poster_url; // full URL string or null
};

export const getMovieAwards = async (tconst) => {
  const response = await api.get(`/movies/${tconst}/awards`);
  return response.data.awards;
};
