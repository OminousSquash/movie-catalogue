// movieService.js

import api from "./api";

/**
 * ADDED: Fetches all genres from the database.
 * Used by FilterPanel to build the genre checkbox list dynamically.
 * This guarantees genre names match exactly what's in the DB.
 */
export const getGenres = async () => {
  const response = await api.get("/movies/genres");
  return response.data; // returns string[]
};

/**
 * Search movies with filters.
 * All filters sent as query params (GET request).
 * Arrays serialised as repeated keys: ?genres=Action&genres=Drama
 */
export const searchMovies = async (filters, page = 1) => {
  const params = { page };

  // FIXED: changed `if (filters.title)` style checks to explicit checks.
  // The old `if (value)` check silently drops falsy values like 0, 0.0, false.
  // `!== undefined` ensures we only skip params the user genuinely didn't set.
  if (filters.title) params.title = filters.title;
  if (filters.start_year !== undefined) params.start_year = filters.start_year;
  if (filters.end_year !== undefined) params.end_year = filters.end_year;
  if (filters.min_rating !== undefined) params.min_rating = filters.min_rating;
  if (filters.max_rating !== undefined) params.max_rating = filters.max_rating;
  if (filters.min_runtime !== undefined) params.min_runtime = filters.min_runtime;
  if (filters.max_runtime !== undefined) params.max_runtime = filters.max_runtime;
  if (filters.min_votes !== undefined) params.min_votes = filters.min_votes;
  if (filters.max_votes !== undefined) params.max_votes = filters.max_votes;

  // Arrays — only include if non-empty
  if (filters.genres?.length) params.genres = filters.genres;
  if (filters.tags?.length) params.tags = filters.tags;
  if (filters.actors?.length) params.actors = filters.actors;
  if (filters.directors?.length) params.directors = filters.directors;
  if (filters.writers?.length) params.writers = filters.writers;

  const response = await api.get("/movies/", {
    params,
    // IMPORTANT: axios default serialises arrays as genres[0]=X&genres[1]=Y
    // but FastAPI expects genres=X&genres=Y (repeated keys, no index).
    // This custom serialiser produces the correct format.
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

  return response.data; // { data, page, page_size, total, total_pages }
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

// import api from "./api";

// export const searchMovies = async (filters) => {
//   const body = {};

//   if (filters.actors?.length) body.actors = filters.actors;
//   if (filters.directors?.length) body.directors = filters.directors;
//   if (filters.genres?.length) body.genres = filters.genres;
//   if (filters.writers?.length) body.writers = filters.writers;

//   const params = {};

//   if (filters.title) params.title = filters.title;
//   if (filters.start_year) params.start_year = filters.start_year;
//   if (filters.end_year) params.end_year = filters.end_year;
//   if (filters.min_rating) params.min_rating = filters.min_rating;
//   if (filters.max_rating) params.max_rating = filters.max_rating;
//   if (filters.min_runtime) params.min_runtime = filters.min_runtime;
//   if (filters.max_runtime) params.max_runtime = filters.max_runtime;

//   try {
//     const response = await api.post("/movies/", body, { params });
//     return response.data;
//   } catch (err) {
//     console.error("Search failed", err);
//     throw err;
//   }
// };

// export const getRecentMovies = async () => {
//   const response = await api.get("/movies/recent");
//   return response.data;
// };
