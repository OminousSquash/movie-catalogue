import api from "./api";

export const searchMovies = async (filters) => {
  const body = {};

  if (filters.actors?.length) body.actors = filters.actors;
  if (filters.directors?.length) body.directors = filters.directors;
  if (filters.genres?.length) body.genres = filters.genres;
  if (filters.writers?.length) body.writers = filters.writers;

  const params = {};

  if (filters.title) params.title = filters.title;
  if (filters.start_year) params.start_year = filters.start_year;
  if (filters.end_year) params.end_year = filters.end_year;
  if (filters.min_rating) params.min_rating = filters.min_rating;
  if (filters.max_rating) params.max_rating = filters.max_rating;
  if (filters.min_runtime) params.min_runtime = filters.min_runtime;
  if (filters.max_runtime) params.max_runtime = filters.max_runtime;

  try {
    const response = await api.post("/movies/", body, { params });
    return response.data;
  } catch (err) {
    console.error("Search failed", err);
    throw err;
  }
};

export const getRecentMovies = async () => {
  const response = await api.get("/movies/recent");
  return response.data;
};
