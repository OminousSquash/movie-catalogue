import api from "./api";

const CACHE_PREFIX = "viewer-ratings-cache-v1";

const getCacheKey = (type, params = {}) =>
  `${CACHE_PREFIX}:${type}:${JSON.stringify(params)}`;

const readCache = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache failures and continue with network data.
  }
};

async function fetchCached(type, path, params = {}) {
  const cacheKey = getCacheKey(type, params);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const res = await api.get(path, { params });
  writeCache(cacheKey, res.data);
  return res.data;
}

export const getViewerHarshness = () =>
  fetchCached("harshness", "/rating_analysis/viewer_harshness");

export const getLowRatingGenres = () =>
  fetchCached("low-rating-genres", "/rating_analysis/low_rating_genres");

export const getGenreCorrelationMatrix = () =>
  fetchCached("genre-correlation-matrix", "/rating_analysis/genre_correlation_matrix");

export const getConditionalLowRating = (genreA, genreB) =>
  fetchCached("conditional-low-rating", "/rating_analysis/conditional_low_rating", {
    genre_a: genreA,
    genre_b: genreB,
  });

export const getConditionalHighRating = (genreA, genreB) =>
  fetchCached("conditional-high-rating", "/rating_analysis/conditional_high_rating", {
    genre_a: genreA,
    genre_b: genreB,
  });
