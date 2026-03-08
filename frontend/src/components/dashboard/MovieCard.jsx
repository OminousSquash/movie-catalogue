import React from "react";

const MovieCard = ({ movie }) => {
  const title = movie.primary_title ?? movie.primaryTitle ?? "";
  const year = movie.start_year ?? movie.startYear ?? "";
  const rating = movie.average_rating ?? movie.averageRating ?? "";
  const runtime = movie.runtime_minutes ?? movie.runtimeMinutes ?? "";
  const actors = movie.actors ?? [];

  return (
    <div className="movie-card" style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
      {movie.poster && <img src={movie.poster} alt={title} style={{ width: "100%", borderRadius: "4px" }} />}
      <h3>{title}</h3>
      <p>Year: {year}</p>
      <p>Rating: {rating}</p>
      <p>Runtime: {runtime} mins</p>
      {movie.director && <p>Director: {movie.director}</p>}
      {actors.length > 0 && <p>Actors: {actors.join(", ")}</p>}
    </div>
  );
};

export default MovieCard;
