import api from "./api"

const CACHE_PREFIX = "trend-analysis-cache-v1";

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


export const getGenreTrends = async () => {
    const cacheKey = getCacheKey("genre", {})
    const cachedData = readCache(cacheKey)
    if (cachedData) {
        return cachedData;
    }
    const res = await api.get("/trend_analysis/genres");
    writeCache(cacheKey, res.data);
    return res.data;
}

export const getContributorTrends = async (filters) => {
    const body = {};
    if (filters.genres?.length) body.genres = filters.genres;
    body.last_decade = filters.last_decade;

    const cacheKey = getCacheKey("contributors", body);
    const cached = readCache(cacheKey);
    if (cached) return cached;

    const result = await api.post("/trend_analysis/contributors", body);

    writeCache(cacheKey, result.data);
    return result.data;
};