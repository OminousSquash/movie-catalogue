import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { formatApiErrorDetail, getUserListById } from "../services/userListService";
import MovieCard from "../components/dashboard/MovieCard";
import "./ListDetails.css";

export default function ListDetails({isAuthenticated}) {
  const { listId } = useParams();
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadList = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserListById(listId);
        setListData(data);
      } catch (err) {
        setError(formatApiErrorDetail(err, "Failed to load list details."));
      } finally {
        setLoading(false);
      }
    };

    loadList();
  }, [listId]);

  const groupedMovies = useMemo(() => {
    if (!listData?.movies || typeof listData.movies !== "object") {
      return [];
    }
    return Object.entries(listData.movies)
      .map(([genre, titles]) => ({
        genre,
        titles: Array.isArray(titles) ? titles : [],
      }))
      .filter((group) => group.titles.length > 0);
  }, [listData]);

  return (
    <Container sx={{ py: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {listData?.list_name || "List"}
          </Typography>
          {listData?.list_note ? (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {listData.list_note}
            </Typography>
          ) : null}

          {groupedMovies.length === 0 ? (
            <Paper sx={{ p: 2 }}>
              <Typography>No movies in this list.</Typography>
            </Paper>
          ) : (
            groupedMovies.map((group) => (
              <section key={group.genre} className="list-details-genre-section">
                <Typography variant="h5" className="list-details-genre-title">
                  {group.genre}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <div className="list-details-genre-row">
                  {group.titles.map((movie, index) => (
                    <div key={`${group.genre}-${movie.tconst ?? movie.primary_title ?? index}`} className="list-details-movie-card">
                      <MovieCard
                        movie={
                          typeof movie === "string"
                            ? { primary_title: movie }
                            : movie
                        }
                        compact
                        isAuthenticated={isAuthenticated}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </Container>
  );
}
