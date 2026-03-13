import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const updateAppUserDetailsService = async (username, ratings) => {
  const response = await api.put(
      "/account/update",
      {
        app_username: username.trim(),
        openness: parseInt(ratings["Openness"]),
        agreeableness: parseInt(ratings["Agreeableness"]),
        emotional_stability: parseInt(ratings["Emotional Stability"]),
        conscientiousness: parseInt(ratings["Conscientiousness"]),
        extraversion: parseInt(ratings["Extraversion"]),
      },
      { headers: getAuthHeaders() }
    );
  return response.data;
};