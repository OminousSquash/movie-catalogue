import PersonalityTraits from "../pages/personalityTraits";
import api from "./api";

export const getTraitGenreCorrelations = async (trait=null, genre=null) => {
    const body = {};
    if (trait) body.personality_or_genre_a = trait;
    if (genre) body.personality_or_genre_b = genre;
    const res = await api.post("/personality_traits/correlation", body);
    return res.data;
};

export const getGenreProfiles = async (genre=null, minUsers=200) => {
    const body = {minimum_no_users: minUsers};
    if (genre) body.genre = genre;
    const res = await api.post("/personality_traits/genre_profiles", body);
    return res.data;
};