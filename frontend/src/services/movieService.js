import api from "./api";

export const searchMovies = async (filters, page = 1) => {
  const body = {};

  if (filters.title) body.title = filters.title;
  if (filters.start_year !== undefined) body.start_year = Number(filters.start_year);
  if (filters.end_year !== undefined) body.end_year = Number(filters.end_year);
  if (filters.min_rating !== undefined) body.min_rating = Number(filters.min_rating);
  if (filters.max_rating !== undefined) body.max_rating = Number(filters.max_rating);
  if (filters.min_runtime !== undefined) body.min_runtime = Number(filters.min_runtime);
  if (filters.max_runtime !== undefined) body.max_runtime = Number(filters.max_runtime);
  if (filters.min_votes !== undefined) body.min_votes = Number(filters.min_votes);
  if (filters.max_votes !== undefined) body.max_votes = Number(filters.max_votes);
  if (filters.tags?.length) body.tags = filters.tags;

  if (filters.actors?.length) body.actors = filters.actors;
  if (filters.directors?.length) body.directors = filters.directors;
  if (filters.genres?.length) body.genres = filters.genres;
  if (filters.writers?.length) body.writers = filters.writers;
  const response = await api.post("/movies/", body, { params: { page } });
  return response.data;
};

export const getRecentMovies = async () => {
  const response = await api.get("/movies/recent");
  return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
};

export const getGenres = async () => {
  const response = await api.get("/movies/genres");
  return Array.isArray(response.data) ? response.data : [];
};

export const getMovieDetails = async (tconst) => {
  const response = await api.get(`/movies/${tconst}`);
  return response.data;
};
