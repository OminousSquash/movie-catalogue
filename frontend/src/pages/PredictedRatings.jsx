import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack
} from "@mui/material";

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
        uncertainty: movie.prediction_uncertainty
      }
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
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 3,
                border: "1px solid rgba(232,201,126,0.15)"
              }}
            >

              <Typography variant="h6" sx={{ minWidth: 250 }}>
                {movie.primary_title} ({movie.start_year})
              </Typography>


              <Button
                variant="contained"
                color="primary"
                disabled={prediction}
                onClick={() => handlePredict(movie)}
              >
                {prediction ? "Predicted" : "Predict"}
              </Button>

              {prediction && (
                <>
                  <Typography>
                    ⭐ {prediction.rating}
                  </Typography>

                  <Typography color="text.secondary">
                    ±{prediction.uncertainty}
                  </Typography>
                </>
              )}

            </Paper>
          );
        })}
      </Stack>

    </Box>
  );
}