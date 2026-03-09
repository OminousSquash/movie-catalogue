import { useMemo, useState } from "react";
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import "./MovieListCard.css";

const FALLBACK_POSTER = "https://placehold.co/600x360?text=Movie+List";

function resolvePosterCandidates(coverTconst) {
  if (!coverTconst) {
    return [FALLBACK_POSTER];
  }
  const base = "http://localhost:8000/posters";
  return [
    `${base}/${coverTconst}.jpg`,
    `${base}/${coverTconst}.png`,
    `${base}/${coverTconst}.webp`,
    FALLBACK_POSTER,
  ];
}

export default function MovieListCard({
  list,
  onEdit,
  onDelete,
  onOpenList,
  editable = false,
}) {
  const candidates = useMemo(() => resolvePosterCandidates(list.cover_tconst), [list.cover_tconst]);
  const [imageIndex, setImageIndex] = useState(0);
  const noteText = list.list_note || "No note provided";

  return (
      <Card className="movie-list-card">
        <div className="movie-list-card-media-wrap">
        <CardMedia
          component="img"
          height="170"
          image={candidates[imageIndex]}
          alt={list.list_name}
          onError={() => {
            setImageIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : prev));
          }}
        />
        <div className="movie-list-card-note-overlay">
          <Typography variant="body2" className="movie-list-card-note-text">
            {noteText}
          </Typography>
        </div>
        </div>
        <CardContent>
          {onOpenList ? (
            <Button
              variant="text"
              className="movie-list-card-name-button"
              onClick={() => onOpenList(list.list_id)}
            >
              {list.list_name}
            </Button>
          ) : (
            <Typography variant="h6" className="movie-list-card-title">
              {list.list_name}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Creator: {list.creator_username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Movies: {list.movie_count ?? 0}
          </Typography>
        </CardContent>
        {editable ? (
          <CardActions>
            <Button size="small" onClick={() => onEdit?.(list)}>Update</Button>
            <Button size="small" color="error" onClick={() => onDelete?.(list.list_id)}>Delete</Button>
          </CardActions>
        ) : null}
      </Card>
  );
}
