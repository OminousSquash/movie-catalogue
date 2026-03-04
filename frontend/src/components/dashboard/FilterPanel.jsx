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

    const filters = {
      title: title.trim() || undefined,
      start_year: startYear !== "" ? parseInt(startYear) : undefined,
      end_year: endYear !== "" ? parseInt(endYear) : undefined,
      min_rating: minRating !== "" ? parseFloat(minRating) : undefined,
      max_rating: maxRating !== "" ? parseFloat(maxRating) : undefined,
      min_runtime: minRuntime !== "" ? parseInt(minRuntime) : undefined,
      max_runtime: maxRuntime !== "" ? parseInt(maxRuntime) : undefined,
      directors: director.trim() ? [director.trim()] : [],
      actors: actors ? actors.split(",").map((a) => a.trim()).filter(Boolean) : [],
      writers: writers ? writers.split(",").map((w) => w.trim()).filter(Boolean) : [],
      genres: selectedGenres,
      tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
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

      <div style={sectionStyle}>
        <label style={labelStyle}>Title</label>
        <input style={inputStyle} placeholder="e.g. Inception"
          value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Release Year</label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="From"
            type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="To"
            type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
        </div>
      </div>

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

      <div style={sectionStyle}>
        <label style={labelStyle}>Runtime (mins)</label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Min"
            type="number" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Max"
            type="number" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} />
        </div>
      </div>

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

      <div style={sectionStyle}>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input style={inputStyle} placeholder="e.g. mind-bending, based on book"
          value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Genres</label>
        <div style={{
          maxHeight: "160px", overflowY: "auto",
          border: "1px solid #ccc", borderRadius: "4px", padding: "6px 8px",
        }}>
          {genresLoading ? (
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Loading genres...</p>
          ) : availableGenres.length === 0 ? (
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