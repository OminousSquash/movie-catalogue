import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getGenres } from "../../services/movieService";

const SectionLabel = ({ children }) => (
  <Typography
    variant="overline"
    sx={{
      color: "primary.main",
      fontSize: "0.65rem",
      letterSpacing: "0.1em",
      fontWeight: 700,
      display: "block",
      mb: 1,
      mt: 0.5,
    }}
  >
    {children}
  </Typography>
);

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
  const [genresOpen, setGenresOpen] = useState(true);

  useEffect(() => {
    getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) => {
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

  const handleReset = () => {
    setTitle(""); setStartYear(""); setEndYear("");
    setMinRating(""); setMaxRating(""); setMinRuntime(""); setMaxRuntime("");
    setDirector(""); setActors(""); setWriters("");
    setSelectedGenres(new Set());
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography
        variant="h6"
        sx={{ fontFamily: "Playfair Display, serif", mb: 2, color: "text.primary" }}
      >
        Filters
      </Typography>

      <Stack spacing={1.5}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          inputProps={{ style: { fontSize: "0.85rem" } }}
        />

        <Box>
          <SectionLabel>Year</SectionLabel>
          <Stack direction="row" spacing={1}>
            <TextField
              label="From"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              inputProps={{ min: 1878, max: 2050 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="To"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              inputProps={{ min: 1878, max: 2050 }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>

        <Box>
          <SectionLabel>Rating</SectionLabel>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Min"
              type="number"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max"
              type="number"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>

        <Box>
          <SectionLabel>Runtime (mins)</SectionLabel>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Min"
              type="number"
              value={minRuntime}
              onChange={(e) => setMinRuntime(e.target.value)}
              inputProps={{ min: 1, max: 600 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max"
              type="number"
              value={maxRuntime}
              onChange={(e) => setMaxRuntime(e.target.value)}
              inputProps={{ min: 1, max: 600 }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <SectionLabel>People</SectionLabel>
          <Stack spacing={1}>
            <TextField
              label="Director"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              fullWidth
            />
            <TextField
              label="Actor"
              value={actors}
              onChange={(e) => setActors(e.target.value)}
              fullWidth
            />
            <TextField
              label="Writer"
              value={writers}
              onChange={(e) => setWriters(e.target.value)}
              fullWidth
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            onClick={() => setGenresOpen((o) => !o)}
          >
            <SectionLabel>Genres</SectionLabel>
            <IconButton size="small" sx={{ color: "primary.main", mt: -0.5 }}>
              {genresOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Collapse in={genresOpen}>
            {availableGenres.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Loading genres…
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                  maxHeight: 260,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 3 },
                  "&::-webkit-scrollbar-thumb": { background: "#3a3530" },
                }}
              >
                {availableGenres.map(({ genre_id, genre }) => (
                  <FormControlLabel
                    key={genre_id}
                    label={
                      <Typography variant="caption" sx={{ fontSize: "0.78rem", color: "text.primary" }}>
                        {genre}
                      </Typography>
                    }
                    control={
                      <Checkbox
                        checked={selectedGenres.has(genre)}
                        onChange={() => toggleGenre(genre)}
                        size="small"
                      />
                    }
                    sx={{ m: 0, py: 0.25 }}
                  />
                ))}
              </Box>
            )}
          </Collapse>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Search
        </Button>
        <Button type="button" variant="outlined" color="primary" onClick={handleReset} sx={{ flexShrink: 0 }}>
          Reset
        </Button>
      </Stack>
    </Box>
  );
};

export default FilterPanel;