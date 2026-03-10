import api from "./api";

export const getContributorDetails = async (nconst) => {
    const response = await api.get(`/contributor/${nconst}`);
    return response.data;
}