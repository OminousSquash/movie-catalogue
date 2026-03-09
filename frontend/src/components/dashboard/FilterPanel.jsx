import React, { useState, useEffect } from "react";
import { getGenres } from "../../services/movieService";

const FilterPanel = ({ onSearch }) => {
  const [title, setTitle] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [minRuntime, setMinRuntime] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [director, setDirector] = useState("");
  const [actors, setActors] = useState("");
  const [writers, setWriters] = useState("");
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(new Set());

  useEffect(() => {
    getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      const next = new Set(prev);
      next.has(genre) ? next.delete(genre) : next.add(genre);
      return next;
    });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  onSearch({
    title,
    start_year: startYear || undefined,
    end_year: endYear || undefined,
    min_rating: minRating || undefined,
    max_rating: maxRating || undefined,
    min_runtime: minRuntime || undefined,
    max_runtime: maxRuntime || undefined,

    directors: director ? [director] : [],
    actors: actors ? [actors] : [],
    genres: [...selectedGenres],
    writers: writers ? [writers] : [],
  });
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Filters</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Start Year" type="number" min="1800" max="2050" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
      <input placeholder="End Year" type="number" min="1800" max="2050" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
      <input placeholder="Min Rating" type="number" min="0" max="10" step="0.1" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      <input placeholder="Max Rating" type="number" min="0" max="10" step="0.1" value={maxRating} onChange={(e) => setMaxRating(e.target.value)} />
      <input placeholder="Min Runtime" type="number" min="1" max="300" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} />
      <input placeholder="Max Runtime" type="number" min="1" max="300" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} />
      <input placeholder="Director" value={director} onChange={(e) => setDirector(e.target.value)} />
      <input placeholder="Actors" value={actors} onChange={(e) => setActors(e.target.value)} />
      <input placeholder="Writers" value={writers} onChange={(e) => setWriters(e.target.value)}/>
      <fieldset>
        <legend>Genres</legend>
        {availableGenres.length === 0 && <p>Loading the genres...</p>}
        {availableGenres.map(({ genre_id, genre }) => (
          <label key={genre_id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedGenres.has(genre)}
              onChange={() => toggleGenre(genre)}
            />
            {" "}{genre}
          </label>
        ))}
      </fieldset>
      <button type="submit">Search</button>
    </form>
  );
};

export default FilterPanel;
