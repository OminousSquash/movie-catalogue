import MovieCard from "./MovieCard";

export default function MovieResults({ movies }) {
  if (!movies.length) return <p>No results yet</p>;

  return (
    <div>
      {movies.map((movie) => (
        <MovieCard key={movie.tconst} movie={movie} />
      ))}
    </div>
  );
}
