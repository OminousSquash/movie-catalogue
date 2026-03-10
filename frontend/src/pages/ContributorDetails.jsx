import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContributorDetails } from "../services/contributorService";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function ContributorDetails() {
  const { nconst } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContributorDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getContributorDetails(nconst);
        setDetails(response);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load contributor details.");
      } finally {
        setLoading(false);
      }
    };

    loadContributorDetails();
  }, [nconst]);

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const name = details?.name || "Unknown contributor";
  const birthYear = details?.birth_year;
  const deathYear = details?.death_year === -1 ? null : details?.death_year;
  const numMovies = details?.num_movies ?? 0;
  const totalVotes = details?.total_votes ?? 0;
  const avgRating = details?.avg_rating;
  const ratingStd = details?.rating_std;
  const avgVotes = details?.avg_votes;
  const popularWorks = details?.popular_works || [];

  return (
    <Container sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4">{name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {details?.nconst} • Born: {birthYear ?? "Unknown"}
            {deathYear ? ` • Died: ${deathYear}` : ""}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Statistics
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={0.8}>
            <Typography>Movies credited: {numMovies}</Typography>
            <Typography>Total votes: {Number(totalVotes).toLocaleString()}</Typography>
            <Typography>
              Average movie rating: {avgRating == null ? "N/A" : Number(avgRating).toFixed(2)}
            </Typography>
            <Typography>
              Rating std dev: {ratingStd == null ? "N/A" : Number(ratingStd).toFixed(2)}
            </Typography>
            <Typography>
              Average votes per movie: {avgVotes == null ? "N/A" : Number(avgVotes).toFixed(0)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Popular Works
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          {popularWorks.length ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {popularWorks.map((title, index) => (
                <Chip key={`${title}-${index}`} label={title} variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No popular works available.</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
