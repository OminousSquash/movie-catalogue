import React from "react";

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card" style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
      {movie.poster && <img src={movie.poster} alt={movie.primaryTitle} style={{ width: "100%", borderRadius: "4px" }} />}
      <h3>{movie.primaryTitle}</h3>
      <p>Year: {movie.startYear}</p>
      <p>Rating: {movie.averageRating}</p>
      <p>Runtime: {movie.runtimeMinutes} mins</p>
      {movie.director && <p>Director: {movie.director}</p>}
      {movie.actors && <p>Actors: {movie.actors.join(", ")}</p>}
    </div>
  );
};

export default MovieCard;
