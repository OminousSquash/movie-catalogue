import api from "./api"


export const getGenreTrends = async () => {
    const res = await api.get("/trend_analysis/genres");
    return res.data;
}

export const getContributorTrends = async (filters) => {
    const body = {};
    if (filters.genres?.length) body.genres = filters.genres;
    body.last_decade = filters.last_decade;

    const result = await api.post("/trend_analysis/contributors", body);

    return result.data;
};