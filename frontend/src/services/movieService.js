import api from "./api";

const extractMovieRows = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }
  return [];
};

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
  if (filters.has_oscar !== undefined) body.has_oscar = filters.has_oscar;
  if (filters.oscar_year !== undefined) body.oscar_year = Number(filters.oscar_year);
  if (filters.oscar_status) body.oscar_status = filters.oscar_status;
  if (filters.oscar_awards?.length) body.oscar_awards = filters.oscar_awards;

  if (filters.actors?.length) body.actors = filters.actors;
  if (filters.directors?.length) body.directors = filters.directors;
  if (filters.genres?.length) body.genres = filters.genres;
  if (filters.writers?.length) body.writers = filters.writers;

  try {
    const response = await api.post("/movies/", body, { params: { page } });
    return extractMovieRows(response.data);
  } catch (err) {
    console.error("Search failed", err);
    throw err;
  }
};

export const getRecentMovies = async () => {
  const response = await api.get("/movies/recent");
  return extractMovieRows(response.data);
};


export const getGenres = async () => {
  const response = await api.get("/movies/genres");
  return Array.isArray(response.data) ? response.data : [];
};