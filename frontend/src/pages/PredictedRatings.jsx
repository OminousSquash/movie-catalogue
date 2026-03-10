import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CardMedia,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

export default function PredictedRatings() {
  const [movies, setMovies] = useState([]);
  const [predicted, setPredicted] = useState({});

  useEffect(() => {
    fetch("http://localhost:8000/movies/recent")
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, []);

  const handlePredict = (movie) => {
    setPredicted((prev) => ({
      ...prev,
      [movie.tconst]: {
        rating: movie.predicted_rating,
        uncertainty: movie.prediction_uncertainty,
      },
    }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Predict Viewer Ratings for Upcoming Titles
      </Typography>

      <Stack spacing={2}>
        {movies.map((movie) => {
          const prediction = predicted[movie.tconst];

          return (
            <Paper
              key={movie.tconst}
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid rgba(232,201,126,0.15)",
              }}
            >
              {/* Poster */}
              {movie.poster ? (
                <CardMedia
                  component="img"
                  image={movie.poster}
                  alt={movie.primary_title}
                  sx={{ width: 80, height: 120, objectFit: "cover", flexShrink: 0, borderRadius: 1 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 80,
                    height: 120,
                    flexShrink: 0,
                    background: "linear-gradient(160deg, #1e1c18 0%, #2a2720 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "2rem", opacity: 0.25 }}>🎬</Typography>
                </Box>
              )}

              {/* Movie Info + Predict */}
              <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {movie.primary_title} ({movie.start_year})
                  </Typography>
                </Box>

                {/* Predict Button + Rating */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handlePredict(movie)}
                    disabled={!!prediction}
                  >
                    {prediction ? "Predicted" : "Predict"}
                  </Button>

                  {prediction && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography>
                        <StarIcon sx={{ fontSize: 16, color: "#e8c97e" }} />{" "}
                        {prediction.rating}
                      </Typography>
                      <Typography color="text.secondary">±{prediction.uncertainty}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}