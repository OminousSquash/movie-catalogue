import React, { useState } from "react";

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
  const [genres, setGenres] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();

  const filters = {
    title,
    start_year: startYear || undefined,
    end_year: endYear || undefined,
    min_rating: minRating || undefined,
    max_rating: maxRating || undefined,
    min_runtime: minRuntime || undefined,
    max_runtime: maxRuntime || undefined,

    directors: director ? [director] : [],
    actors: actors ? [actors] : [],
    genres: genres ? [genres] : [],
    writers: writers ? [writers] : [],
  };

  onSearch(filters);
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Filters</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Start Year" type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
      <input placeholder="End Year" type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
      <input placeholder="Min Rating" type="number" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      <input placeholder="Max Rating" type="number" value={maxRating} onChange={(e) => setMaxRating(e.target.value)} />
      <input placeholder="Min Runtime" type="number" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} />
      <input placeholder="Max Runtime" type="number" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} />
      <input placeholder="Director" value={director} onChange={(e) => setDirector(e.target.value)} />
      <input placeholder="Actors" value={actors} onChange={(e) => setActors(e.target.value)} />
      <input placeholder="Writers" value={writers} onChange={(e) => setWriters(e.target.value)}/>
      <input placeholder="Genres" value={genres} onChange={(e) => setGenres(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
};

export default FilterPanel;
