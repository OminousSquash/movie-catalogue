import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { getMovieDetails } from "../services/movieService";
import { Link } from "react-router-dom";

function ContributorLinks({ people = [] }) {
  if (!people.length) {
    return <Box component="span" sx={{ color: "text.secondary" }}>N/A</Box>;
  }

  return (
    <>
      {people.map((person, index) => (
        <Box component="span" key={`${person.nconst}-${index}`}>
          <Box
            component={Link}
            to={`/contributors/${person.nconst}`}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {person.primary_name}
          </Box>
          {index < people.length - 1 ? ", " : ""}
        </Box>
      ))}
    </>
  );
}

export default function MovieDetails() {
  const { tconst } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMovieDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getMovieDetails(tconst);
        setDetails(response);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [tconst]);

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

  const movie = details?.movie || {};
  const genres = details?.genres || [];
  const tags = details?.tags || [];
  const contributors = details?.contributors || {};
  const prediction = details?.predicted_rating;

  return (
    <Container sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, p: 2, flexWrap: { xs: "wrap", md: "nowrap" } }}>
          {movie.poster ? (
            <CardMedia
              component="img"
              image={movie.poster}
              alt={movie.primary_title}
              sx={{ width: 220, borderRadius: 1, objectFit: "cover" }}
            />
          ) : null}
          <CardContent sx={{ p: 0, "&:last-child": { p: 0 }, flex: 1 }}>
            <Typography variant="h4">{movie.primary_title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {movie.tconst} • {movie.start_year ?? "Unknown year"} • {movie.runtime_minutes ?? "?"} mins
            </Typography>
            {!prediction && (
              <Typography sx={{ mt: 1 }}>
                Rating: {movie.average_rating ?? "N/A"} ({movie.num_votes ?? 0} votes)
              </Typography>
            )}

            {prediction ? (
              <Typography sx={{ mt: 1 }}>
                Predicted rating: {prediction.predicted_rating} (uncertainty {prediction.prediction_uncertainty})
              </Typography>
            ) : null}

            <Typography sx={{ mt: 1 }}>
              Adult: {movie.is_adult ? "Yes" : "No"}
            </Typography>


            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
              {genres.map((genre) => (
                <Chip key={genre} label={genre} />
              ))}
            </Stack>
          </CardContent>
        </Box>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Contributors</Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Typography sx={{ mb: 1 }}>
            Directors:{" "}
            <ContributorLinks people={contributors.directors || []} />
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Actors:{" "}
            <ContributorLinks people={contributors.actors || []} />
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Writers:{" "}
            <ContributorLinks people={contributors.writers || []} />
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Tags</Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {tags.length ? tags.map((tag) => (
              <Chip key={tag.tag_id} label={tag.tag_name} variant="outlined" />
            )) : <Typography color="text.secondary">No tags available.</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
