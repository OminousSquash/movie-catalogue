import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies, getGenres, getTopRatedMovies } from "../services/movieService";
import { addMovieToList, formatApiErrorDetail, getMyLists } from "../services/userListService";

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

const Dashboard = ({ isAuthenticated = false }) => {
  const [filterState, setFilterState] = useState(INITIAL_FILTERS);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [genresOpen, setGenresOpen] = useState(true);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(null);
  const [myLists, setMyLists] = useState([]);
  const [listsLoaded, setListsLoaded] = useState(false);
  const [listPickerAnchorEl, setListPickerAnchorEl] = useState(null);
  const [activeMovieTconst, setActiveMovieTconst] = useState(null);
  const [listPickerLoading, setListPickerLoading] = useState(false);
  const [addingToListId, setAddingToListId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const lastFilters = useRef({});
  
  useEffect(() => {
    getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  useEffect(() => {
    handleSearch({});
  }, []);

  const fetchTopRated = async () => {
    setLoading(true);
    try {
      const data = await getTopRatedMovies();
      setMovies(data);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalResults(data.length);
    } catch (err) {
      console.error("Failed to fetch top rated movies", err);
    }
    setLoading(false);
  };

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

  const handleOpenAddMenu = async (event, movie) => {
    if (!isAuthenticated) {
      return;
    }
    setMessage({ type: "", text: "" });
    setActiveMovieTconst(movie.tconst);
    setListPickerAnchorEl(event.currentTarget);
    if (!listsLoaded) {
      setListPickerLoading(true);
      try {
        const lists = await getMyLists();
        setMyLists(lists || []);
        setListsLoaded(true);
      } catch (err) {
        setMessage({
          type: "error",
          text: formatApiErrorDetail(err, "Failed to load your lists."),
        });
      } finally {
        setListPickerLoading(false);
      }
    }
  };

  const handleCloseAddMenu = () => {
    setListPickerAnchorEl(null);
    setActiveMovieTconst(null);
    setAddingToListId(null);
  };

  const handleAddMovieToList = async (listId) => {
    if (!activeMovieTconst) {
      return;
    }
    setAddingToListId(listId);
    try {
      const result = await addMovieToList(listId, activeMovieTconst);
      setMessage({ type: "success", text: result?.message || "Movie added successfully." });
      handleCloseAddMenu();
    } catch (err) {
      setMessage({
        type: "error",
        text: formatApiErrorDetail(err, "Failed to add movie to list."),
      });
      setAddingToListId(null);
    }
  };

  const content = (
    <Fade in={!loading} timeout={300}>
      <Box>
        {message.text ? (
          <Alert severity={message.type || "info"} sx={{ mb: 1.5 }}>
            {message.text}
          </Alert>
        ) : null}
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
          movies.map((m) => (
            <MovieCard
              key={m.tconst}
              movie={m}
              isAuthenticated={isAuthenticated}
              onAddClick={handleOpenAddMenu}
              isAddBusy={Boolean(addingToListId)}
            />
          ))
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
    <>
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
      <Menu
        anchorEl={listPickerAnchorEl}
        open={Boolean(listPickerAnchorEl)}
        onClose={handleCloseAddMenu}
      >
        {listPickerLoading ? (
          <MenuItem disabled>Loading your lists...</MenuItem>
        ) : myLists.length === 0 ? (
          <MenuItem disabled>No lists yet</MenuItem>
        ) : (
          myLists.map((list) => (
            <MenuItem
              key={list.list_id}
              onClick={() => handleAddMovieToList(list.list_id)}
              disabled={addingToListId === list.list_id}
            >
              {addingToListId === list.list_id ? "Adding..." : list.list_name}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default Dashboard;
