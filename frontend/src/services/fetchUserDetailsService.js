import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};


export const fetchUserDetailsService = async () => {
  const response = await api.get("/account/details", {
    headers: getAuthHeaders(),
  });
  return response.data;
};