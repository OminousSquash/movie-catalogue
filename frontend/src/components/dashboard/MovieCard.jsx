import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const MovieCard = ({ movie }) => {
  const title = movie.primary_title ?? movie.primaryTitle ?? "";
  const year = movie.start_year ?? movie.startYear ?? "";
  const rating = movie.average_rating ?? movie.averageRating ?? null;
  const runtime = movie.runtime_minutes ?? movie.runtimeMinutes ?? null;
  const actors = movie.actors ?? [];

  return (
    <Card
      sx={{
        display: "flex",
        gap: 0,
        mb: 1.5,
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {movie.poster ? (
        <CardMedia
          component="img"
          image={movie.poster}
          alt={title}
          sx={{ width: 80, flexShrink: 0, objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            width: 80,
            flexShrink: 0,
            background: "linear-gradient(160deg, #1e1c18 0%, #2a2720 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "1.8rem", opacity: 0.25 }}>🎬</Typography>
        </Box>
      )}

      <CardContent sx={{ flex: 1, py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Playfair Display, serif",
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "text.primary",
            mb: 0.75,
          }}
        >
          {title}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
          {year && (
            <Stack direction="row" spacing={0.4} alignItems="center">
              <CalendarTodayIcon sx={{ fontSize: "0.7rem", color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">{year}</Typography>
            </Stack>
          )}
          {runtime && (
            <Stack direction="row" spacing={0.4} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: "0.7rem", color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">{runtime} min</Typography>
            </Stack>
          )}
          {rating != null && (
            <Chip
              icon={<StarIcon sx={{ fontSize: "0.7rem !important", color: "#e8c97e !important" }} />}
              label={Number(rating).toFixed(1)}
              size="small"
              sx={{
                background: "rgba(232, 201, 126, 0.1)",
                color: "#e8c97e",
                border: "1px solid rgba(232, 201, 126, 0.25)",
                fontWeight: 700,
                fontSize: "0.72rem",
                height: 20,
              }}
            />
          )}
        </Stack>

        {movie.director && (
          <Typography variant="caption" color="text.secondary" display="block">
            <Box component="span" sx={{ color: "text.primary", opacity: 0.6, mr: 0.5 }}>Dir.</Box>
            {movie.director}
          </Typography>
        )}

        {actors.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
            <Box component="span" sx={{ color: "text.primary", opacity: 0.6, mr: 0.5 }}>Cast</Box>
            {actors.join(", ")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MovieCard;