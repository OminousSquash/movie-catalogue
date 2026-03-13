import { useEffect, useMemo, useState } from "react";
import {
  Alert, CircularProgress, Container, Divider, Paper, Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/dashboard/MovieCard";
import { fetchRecommendedMoviesService } from "../services/fetchRecommendedMoviesService";
import { useAddToList } from "../hooks/useAddToList";
import ListPickerMenu from "../components/ListPickerMenu";

export default function RecommendedMovies({ isAuthenticated }) {
  const navigate = useNavigate();
  const [moviesData, setMoviesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    message, addingToListId, listPickerAnchorEl, listPickerLoading,
    myLists, handleOpenAddMenu, handleCloseAddMenu, handleAddMovieToList,
  } = useAddToList();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    const loadRecommendedMovies = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRecommendedMoviesService();
        setMoviesData(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load recommended movies.");
      } finally {
        setLoading(false);
      }
    };
    loadRecommendedMovies();
  }, [isAuthenticated]);

  const groupedMovies = useMemo(() => {
    if (!moviesData || typeof moviesData !== "object") return [];
    return Object.entries(moviesData)
      .map(([genre, movies]) => ({ genre, titles: Array.isArray(movies) ? movies : [] }))
      .filter((group) => group.titles.length > 0);
  }, [moviesData]);

  return (
    <>
      <Container sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Recommended For You</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Top movies based on your personality traits.
        </Typography>

        {message.text && (
          <Alert severity={message.type || "info"} sx={{ mb: 1.5 }}>{message.text}</Alert>
        )}

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : groupedMovies.length === 0 ? (
          <Paper sx={{ p: 2 }}>
            <Typography>No recommendations found. Try updating your personality traits.</Typography>
          </Paper>
        ) : (
          groupedMovies.map((group) => (
            <section key={group.genre} className="list-details-genre-section">
              <Typography variant="h5" className="list-details-genre-title">{group.genre}</Typography>
              <Divider sx={{ mb: 1.5 }} />
              {group.titles.map((movie, index) => (
                <MovieCard
                  key={`${group.genre}-${movie.tconst ?? movie.primary_title ?? index}`}
                  movie={typeof movie === "string" ? { primary_title: movie } : movie}
                  isAuthenticated={isAuthenticated}
                  onAddClick={handleOpenAddMenu}
                  isAddBusy={Boolean(addingToListId)}
                />
              ))}
            </section>
          ))
        )}
      </Container>

      <ListPickerMenu
        anchorEl={listPickerAnchorEl}
        onClose={handleCloseAddMenu}
        lists={myLists}
        loading={listPickerLoading}
        addingToListId={addingToListId}
        onSelect={handleAddMovieToList}
      />
    </>
  );
}