import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const savePersonality = async (ratings) => {
  const response = await api.post(
    "/account/store_personality",
    {
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