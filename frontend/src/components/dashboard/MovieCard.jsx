import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const FALLBACK_POSTER = "https://placehold.co/600x900?text=No+Poster";

const getPosterCandidates = (movie) => {
  const candidates = [];
  const tconst = movie?.tconst;

  if (movie?.poster) {
    candidates.push(movie.poster);
  }

  if (tconst) {
    const base = "http://localhost:8000/posters";
    candidates.push(`${base}/${tconst}.jpg`);
    candidates.push(`${base}/${tconst}.png`);
    candidates.push(`${base}/${tconst}.webp`);
  }

  candidates.push(FALLBACK_POSTER);
  return [...new Set(candidates)];
};

const MovieCard = ({
  movie,
  isAuthenticated = false,
  onAddClick,
  isAddBusy = false,
  compact = false,
}) => {
  console.log("movie: ", movie)
  const title = movie.primary_title ?? movie.primaryTitle ?? "";
  const year = movie.start_year ?? movie.startYear ?? "";
  const rating = movie.average_rating ?? movie.averageRating ?? null;
  const predicted_rating = movie.predicted_rating ?? null;
  const runtime = movie.runtime_minutes ?? movie.runtimeMinutes ?? null;
  const actors = movie.actors ?? [];
  console.log("Real rating: ", rating)
  console.log("Predicated rating: ", predicted_rating)
  const cardWidth = compact ? "220px" : "100%";
  const imageHeight = compact ? "260px" : "auto";
  const titleFontSize = compact ? "1.05rem" : "1.4rem";
  const textFontSize = compact ? "0.95rem" : "1rem";
  const posterCandidates = useMemo(() => getPosterCandidates(movie), [movie]);
  const [posterIndex, setPosterIndex] = useState(0);

  useEffect(() => {
    setPosterIndex(0);
  }, [movie?.tconst, movie?.poster]);

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
        {isAuthenticated && !compact ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={(event) => onAddClick?.(event, movie)}
            disabled={isAddBusy}
            sx={{ mb: 1, fontWeight: 700 }}
          >
            Add to List
          </Button>
        ) : null}

        <Typography
          variant="h6"
          component={movie?.tconst ? Link : "h6"}
          to={movie?.tconst ? `/movies/${movie.tconst}` : undefined}
          sx={{
            display: "block",
            fontFamily: "Playfair Display, serif",
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "text.primary",
            mb: 0.75,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
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
          {predicted_rating != null && (
            <Chip
              icon={<StarIcon sx={{ fontSize: "0.7rem !important", color: "#e8c97e !important" }} />}
              label={`Predicted ${Number(predicted_rating).toFixed(1)}`}
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
