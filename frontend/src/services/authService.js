import api from "./api";

const normalizeAuthResponse = (data) => ({
  access_token: data?.access_token ?? "",
  token_type: data?.token_type ?? "bearer",
});

export const login = async ({ username, password }) => {
  const response = await api.post("/account/login", { username, password });
  return normalizeAuthResponse(response.data);
};

export const signup = async ({ username, password }) => {
  const response = await api.post("/account/signup", { username, password });
  return normalizeAuthResponse(response.data);
};
