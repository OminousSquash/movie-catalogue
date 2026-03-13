import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const fetchRecommendedMoviesService = async () => {
  const response = await api.get("/recommended_movies/", {
    headers: getAuthHeaders(),
  });
  return response.data;
};