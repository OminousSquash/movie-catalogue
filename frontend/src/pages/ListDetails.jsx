import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { formatApiErrorDetail, getUserListById } from "../services/userListService";

export default function ListDetails() {
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

  const movieRows = useMemo(() => {
    if (!listData?.movies || typeof listData.movies !== "object") {
      return [];
    }
    return Object.entries(listData.movies).flatMap(([genre, titles]) =>
      (titles || []).map((movieTitle) => ({
        genre,
        movie_title: movieTitle,
      }))
    );
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

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Genre</TableCell>
                  <TableCell>Movie Title</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movieRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2}>No movies in this list.</TableCell>
                  </TableRow>
                ) : (
                  movieRows.map((row, index) => (
                    <TableRow key={`${row.genre}-${row.movie_title}-${index}`}>
                      <TableCell>{row.genre}</TableCell>
                      <TableCell>{row.movie_title}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}
