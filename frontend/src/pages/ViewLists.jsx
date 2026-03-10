import { useEffect, useState } from "react";
import { Alert, CircularProgress, Container, Grid, Typography } from "@mui/material";
import MovieListCard from "../components/MovieListCard";
import { formatApiErrorDetail, getPublicLists } from "../services/userListService";

export default function ViewLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLists = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicLists();
        setLists(data || []);
      } catch (err) {
        setError(formatApiErrorDetail(err, "Failed to load public lists."));
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>View Lists</Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {lists.map((list) => (
            <Grid item xs={12} sm={6} md={3} key={list.list_id}>
              <MovieListCard list={list} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
