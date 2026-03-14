import api from "./api";

export const getViewerHarshness = () =>
  api.get("/rating_analysis/viewer_harshness").then((res) => res.data);

export const getLowRatingGenres = () =>
  api.get("/rating_analysis/low_rating_genres").then((res) => res.data);

export const getGenreCorrelationMatrix = () =>
  api.get("/rating_analysis/genre_correlation_matrix").then((res) => res.data);

export const getConditionalLowRating = (genreA, genreB) =>
  api
    .get("/rating_analysis/conditional_low_rating", {
      params: { genre_a: genreA, genre_b: genreB },
    })
    .then((res) => res.data);

export const getConditionalHighRating = (genreA, genreB) =>
  api
    .get("/rating_analysis/conditional_high_rating", {
      params: { genre_a: genreA, genre_b: genreB },
    })
    .then((res) => res.data);