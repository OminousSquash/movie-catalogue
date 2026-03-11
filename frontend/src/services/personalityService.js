import api from "./api";

const CACHE_PREFIX = "personality-cache-v1";

const getCacheKey = (type, params) =>
  `${CACHE_PREFIX}:${type}:${JSON.stringify(params)}`;

const readCache = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and fall back to network on future calls.
  }
};

export const getTraitGenreCorrelations = async (trait=null, genre=null) => {
    const body = {};
    if (trait) body.personality_or_genre_a = trait;
    if (genre) body.personality_or_genre_b = genre;

    const cacheKey = getCacheKey("correlations", body);
    const cached = readCache(cacheKey);
    if (cached) return cached;

    const res = await api.post("/personality_traits/correlation", body);
    writeCache(cacheKey, res.data);
    return res.data;
};

export const getGenreProfiles = async (genre=null, minUsers=200) => {
    const body = {minimum_no_users: minUsers};
    if (genre) body.genre = genre;

    const cacheKey = getCacheKey("profiles", body);
    const cached = readCache(cacheKey);
    if (cached) return cached;

    const res = await api.post("/personality_traits/genre_profiles", body);
    writeCache(cacheKey, res.data);
    return res.data;
};
