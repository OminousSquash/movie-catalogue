import React from "react";
import { Box, Typography } from "@mui/material";
import MovieCard from "./MovieCard";

export default function MovieResults({ movies }) {
  if (!movies.length) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60%",
          flexDirection: "column",
          gap: 1,
          opacity: 0.4,
        }}
      >
        <Typography sx={{ fontSize: "3rem" }}>🎞</Typography>
        <Typography variant="body2" color="text.secondary">
          No results yet — use the filters to search
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {movies.map((movie) => (
        <MovieCard key={movie.tconst} movie={movie} />
      ))}
    </Box>
  );
}