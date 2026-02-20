// FilterPanel.jsx

import React, { useState, useEffect } from "react";
import { getGenres } from "../../services/movieService";

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  marginBottom: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "13px",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "600",
  color: "#555",
  marginBottom: "3px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const sectionStyle = { marginBottom: "16px" };

const FilterPanel = ({ onSearch, onReset }) => {
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
  const [tagsInput, setTagsInput] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  // FIXED: genres are now fetched from the database on mount instead of being
  // hardcoded. This guarantees the genre names the user sees and selects exactly
  // match what's stored in the DB — previously "Sci-Fi" in the frontend might
  // not match whatever casing/format is in the genres table, silently returning
  // 0 results when genre filter was applied.
  const [availableGenres, setAvailableGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  useEffect(() => {
    getGenres()
      .then(setAvailableGenres)
      .catch(() => setAvailableGenres([]))
      .finally(() => setGenresLoading(false));
  }, []);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // FIXED: numeric values use explicit undefined instead of relying on truthiness.
    // Previously `minRating ? parseFloat(minRating) : undefined` would drop 0
    // as a valid input since 0 is falsy. Now we only set undefined if the field
    // is actually empty.
    const filters = {
      title: title.trim() || undefined,
      start_year: startYear !== "" ? parseInt(startYear) : undefined,
      end_year: endYear !== "" ? parseInt(endYear) : undefined,
      min_rating: minRating !== "" ? parseFloat(minRating) : undefined,
      max_rating: maxRating !== "" ? parseFloat(maxRating) : undefined,
      min_runtime: minRuntime !== "" ? parseInt(minRuntime) : undefined,
      max_runtime: maxRuntime !== "" ? parseInt(maxRuntime) : undefined,
      // Contributor fields: split comma-separated entries into arrays.
      // The backend does LOWER() matching so case doesn't matter here.
      directors: director.trim() ? [director.trim()] : [],
      actors: actors ? actors.split(",").map((a) => a.trim()).filter(Boolean) : [],
      writers: writers ? writers.split(",").map((w) => w.trim()).filter(Boolean) : [],
      genres: selectedGenres,
      tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    // Debug log — check browser console to confirm filter values before sending
    console.log("[FilterPanel] Submitting filters:", filters);

    onSearch(filters);
  };

  const handleReset = () => {
    setTitle("");
    setStartYear("");
    setEndYear("");
    setMinRating("");
    setMaxRating("");
    setMinRuntime("");
    setMaxRuntime("");
    setDirector("");
    setActors("");
    setWriters("");
    setTagsInput("");
    setSelectedGenres([]);
    if (onReset) onReset();
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0, fontSize: "16px", marginBottom: "16px" }}>Filters</h2>

      {/* Title */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Title</label>
        <input style={inputStyle} placeholder="e.g. Inception"
          value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Release Year */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Release Year</label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="From"
            type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="To"
            type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
        </div>
      </div>

      {/* Rating */}
      <div style={sectionStyle}>
        <label style={labelStyle}>IMDb Rating (1–10)</label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Min"
            type="number" step="0.1" min="0" max="10"
            value={minRating} onChange={(e) => setMinRating(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Max"
            type="number" step="0.1" min="0" max="10"
            value={maxRating} onChange={(e) => setMaxRating(e.target.value)} />
        </div>
      </div>

      {/* Runtime */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Runtime (mins)</label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Min"
            type="number" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Max"
            type="number" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} />
        </div>
      </div>

      {/* Contributors */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Director</label>
        <input style={inputStyle} placeholder="e.g. Christopher Nolan"
          value={director} onChange={(e) => setDirector(e.target.value)} />
        <label style={labelStyle}>Actors (comma-separated)</label>
        <input style={inputStyle} placeholder="e.g. Tom Hanks, Meryl Streep"
          value={actors} onChange={(e) => setActors(e.target.value)} />
        <label style={labelStyle}>Writers (comma-separated)</label>
        <input style={inputStyle} placeholder="e.g. Aaron Sorkin"
          value={writers} onChange={(e) => setWriters(e.target.value)} />
      </div>

      {/* Tags */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input style={inputStyle} placeholder="e.g. mind-bending, based on book"
          value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      {/* Genres — loaded from DB, not hardcoded */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Genres</label>
        <div style={{
          maxHeight: "160px", overflowY: "auto",
          border: "1px solid #ccc", borderRadius: "4px", padding: "6px 8px",
        }}>
          {genresLoading ? (
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Loading genres...</p>
          ) : availableGenres.length === 0 ? (
            // If genres fail to load, show a message — previously would just show
            // hardcoded list that might not match DB, silently filtering wrong
            <p style={{ margin: 0, fontSize: "12px", color: "#ef4444" }}>
              Could not load genres from database
            </p>
          ) : (
            availableGenres.map((genre) => (
              <label key={genre} style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", padding: "2px 0", cursor: "pointer",
              }}>
                <input type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)} />
                {genre}
              </label>
            ))
          )}
        </div>
        {selectedGenres.length > 0 && (
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            Selected: {selectedGenres.join(", ")}
          </div>
        )}
      </div>

      {/* Buttons */}
      <button type="submit" style={{
        width: "100%", padding: "8px", backgroundColor: "#2563eb",
        color: "white", border: "none", borderRadius: "4px",
        cursor: "pointer", fontSize: "14px", fontWeight: "600", marginBottom: "8px",
      }}>
        Search
      </button>
      <button type="button" onClick={handleReset} style={{
        width: "100%", padding: "8px", backgroundColor: "transparent",
        color: "#555", border: "1px solid #ccc", borderRadius: "4px",
        cursor: "pointer", fontSize: "13px",
      }}>
        Reset Filters
      </button>
    </form>
  );
};

export default FilterPanel;

// import React, { useState } from "react";

// const FilterPanel = ({ onSearch }) => {
//   const [title, setTitle] = useState("");
//   const [startYear, setStartYear] = useState("");
//   const [endYear, setEndYear] = useState("");
//   const [minRating, setMinRating] = useState("");
//   const [maxRating, setMaxRating] = useState("");
//   const [minRuntime, setMinRuntime] = useState("");
//   const [maxRuntime, setMaxRuntime] = useState("");
//   const [director, setDirector] = useState("");
//   const [actors, setActors] = useState("");
//   const [writers, setWriters] = useState("");
//   const [genres, setGenres] = useState("");

// const handleSubmit = (e) => {
//   e.preventDefault();

//   const filters = {
//     title,
//     start_year: startYear || undefined,
//     end_year: endYear || undefined,
//     min_rating: minRating || undefined,
//     max_rating: maxRating || undefined,
//     min_runtime: minRuntime || undefined,
//     max_runtime: maxRuntime || undefined,

//     directors: director ? [director] : [],
//     actors: actors ? [actors] : [],
//     genres: genres ? [genres] : [],
//     writers: writers ? [writers] : [],
//   };

//   onSearch(filters);
// };


//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Filters</h2>
//       <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
//       <input placeholder="Start Year" type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
//       <input placeholder="End Year" type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
//       <input placeholder="Min Rating" type="number" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
//       <input placeholder="Max Rating" type="number" value={maxRating} onChange={(e) => setMaxRating(e.target.value)} />
//       <input placeholder="Min Runtime" type="number" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} />
//       <input placeholder="Max Runtime" type="number" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} />
//       <input placeholder="Director" value={director} onChange={(e) => setDirector(e.target.value)} />
//       <input placeholder="Actors" value={actors} onChange={(e) => setActors(e.target.value)} />
//       <input placeholder="Writers" value={writers} onChange={(e) => setWriters(e.target.value)}/>
//       <input placeholder="Genres" value={genres} onChange={(e) => setGenres(e.target.value)} />
//       <button type="submit">Search</button>
//     </form>
//   );
// };

// export default FilterPanel;
