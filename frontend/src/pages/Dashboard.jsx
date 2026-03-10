import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies, getGenres } from "../services/movieService";

const INITIAL_FILTERS = {
  title: "",
  startYear: "",
  endYear: "",
  minRating: "",
  maxRating: "",
  minRuntime: "",
  maxRuntime: "",
  director: "",
  actors: "",
  writers: "",
  selectedGenres: new Set(),
};

const Dashboard = () => {
  const [filterState, setFilterState] = useState(INITIAL_FILTERS);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [genresOpen, setGenresOpen] = useState(true);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(null);
  const lastFilters = useRef({});
  
  useEffect(() => {
    getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const data = await getRecentMovies();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch recent movies", err);
    }
    setLoading(false);
  };

  const handleSearch = async (filters, page = 1) => {
    setLoading(true);
    lastFilters.current = filters;
    try {
      const result = await searchMovies(filters, page);
      setMovies(result.data ?? []);
      setCurrentPage(result.page ?? 1);
      setTotalPages(result.total_pages ?? 1);
      setTotalResults(result.total ?? null);
    } catch (err) {
      console.error("Search failed", err);
      setMovies([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalResults(null);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFilterState(INITIAL_FILTERS);
  };

  const handlePrev = () => {
    if (currentPage > 1) handleSearch(lastFilters.current, currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) handleSearch(lastFilters.current, currentPage + 1);
  };

  const content = (
    <Fade in={!loading} timeout={300}>
      <Box>
        {totalResults !== null && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1.5, letterSpacing: "0.05em" }}
          >
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </Typography>
        )}

        {movies.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "55vh",
              gap: 1.5,
              opacity: 0.35,
            }}
          >
            <Typography sx={{ fontSize: "3.5rem" }}>🎞</Typography>
            <Typography variant="body2" color="text.secondary">
              Use the filters to search the catalogue
            </Typography>
          </Box>
        ) : (
          movies.map((m) => <MovieCard key={m.tconst} movie={m} />)
        )}

        {totalPages > 1 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mt: 3, pb: 2 }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={handlePrev}
              disabled={currentPage <= 1}
            >
              Prev
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: "center" }}>
              {currentPage} / {totalPages}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </Stack>
        )}
      </Box>
    </Fade>
  );

  return (
    <DashboardLayout
      children={{
        filters: (
          <FilterPanel
            filterState={filterState}
            setFilterState={setFilterState}
            availableGenres={availableGenres}
            genresOpen={genresOpen}
            setGenresOpen={setGenresOpen}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        ),
        content: loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
            <CircularProgress color="primary" size={36} thickness={2.5} />
          </Box>
        ) : (
          content
        ),
      }}
    />
  );
};

export default Dashboard;