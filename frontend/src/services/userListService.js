import api from "./api";

export const formatApiErrorDetail = (err, fallbackMessage) => {
  const detail = err?.response?.data?.detail;
  if (!detail) {
    return fallbackMessage;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || JSON.stringify(item)).join("; ");
  }
  if (typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return String(detail);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getPublicLists = async () => {
  const response = await api.get("/user_list/public");
  return response.data;
};

export const getMyLists = async () => {
  const response = await api.get("/user_list/me", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createList = async ({ list_name, list_note }) => {
  const response = await api.post(
    "/user_list/",
    { list_name, list_note },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateListName = async (listId, new_list_name) => {
  const response = await api.put(
    `/user_list/list_name/${listId}`,
    { new_list_name },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateListNote = async (listId, new_list_note) => {
  const response = await api.put(
    `/user_list/list_note/${listId}`,
    { new_list_note },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteList = async (listId) => {
  const response = await api.delete(`/user_list/${listId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
