import api from "./api";

export const getGenrePopularity = async () => {
    const res = await api.get("/popularity/genre_popularity_data");
    return res.data;
};

export const getGenrePolarisation = async () => {
    const res = await api.get("/polarisation/");
    return res.data;
};