// MovieCard.jsx

import React, { useEffect, useState } from "react";
import { getMoviePoster, getMovieAwards } from "../../services/movieService";

const POSTER_PLACEHOLDER = "https://placehold.co/600x400?text=Poster+Not+Found";

const MovieCard = ({ movie }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [awards, setAwards] = useState(null);
  const [awardsLoading, setAwardsLoading] = useState(false);

  // Fetch poster on mount — once per card, result cached server-side
  useEffect(() => {
    let cancelled = false;
    getMoviePoster(movie.tconst)
      .then((url) => {
        if (!cancelled) {
          setPosterUrl(url);
          setPosterLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setPosterLoading(false);
      });
    return () => { cancelled = true; };
  }, [movie.tconst]);

  const handleExpand = () => {
    setExpanded((prev) => !prev);
    if (!expanded && awards === null) {
      setAwardsLoading(true);
      getMovieAwards(movie.tconst)
        .then(setAwards)
        .catch(() => setAwards([]))
        .finally(() => setAwardsLoading(false));
    }
  };

  return (
    <div style={{
      display: "flex",
      gap: "12px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "10px",
      backgroundColor: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>

      {/* 
        FIXED flickering: poster container is ALWAYS 80x120px regardless of 
        loading state. Previously the grey box and the img had slightly different
        layout behaviour, causing the card to resize on every poster load which
        made all 20 cards jump around simultaneously.
      */}
      <div style={{
        flexShrink: 0,
        width: "80px",
        height: "120px",
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#f3f4f6", // grey shows while loading, hidden once image loads
      }}>
        {!posterLoading && (
          <img
            src={posterUrl || POSTER_PLACEHOLDER}
            alt={movie.primaryTitle}
            style={{ width: "80px", height: "120px", objectFit: "cover", display: "block" }}
            onError={(e) => { e.target.src = POSTER_PLACEHOLDER; }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          margin: "0 0 4px 0",
          fontSize: "15px",
          fontWeight: "700",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {movie.primaryTitle}
        </h3>

        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
          {movie.startYear && <span style={{ marginRight: "10px" }}>📅 {movie.startYear}</span>}
          {movie.runtimeMinutes && <span style={{ marginRight: "10px" }}>⏱ {movie.runtimeMinutes} min</span>}
          {movie.averageRating && (
            <span style={{ marginRight: "10px" }}>
              ⭐ {movie.averageRating}/10
              {movie.numVotes && (
                <span style={{ color: "#9ca3af" }}> ({movie.numVotes.toLocaleString()} votes)</span>
              )}
            </span>
          )}
        </div>

        {/* Genre pills */}
        {movie.genres?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
            {movie.genres.map((g) => (
              <span key={g} style={{
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                borderRadius: "9999px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: "500",
              }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={handleExpand}
          style={{
            fontSize: "12px",
            color: "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {expanded ? "▲ Hide awards" : "▼ Show awards"}
        </button>

        {/* Awards — only rendered when expanded */}
        {expanded && (
          <div style={{
            marginTop: "8px",
            borderTop: "1px solid #f3f4f6",
            paddingTop: "8px",
            fontSize: "12px",
          }}>
            {awardsLoading ? (
              <p style={{ color: "#9ca3af", margin: 0 }}>Loading awards...</p>
            ) : awards && awards.length > 0 ? (
              <div>
                <strong>Awards:</strong>
                <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                  {awards.slice(0, 5).map((a, i) => (
                    <li key={i} style={{ marginBottom: "2px" }}>
                      <span style={{ fontWeight: "600" }}>{a.event}</span> — {a.type}: {a.award}
                      {a.all_recipients?.length > 0 && ` (${a.all_recipients.join(", ")})`}
                    </li>
                  ))}
                  {awards.length > 5 && (
                    <li style={{ color: "#6b7280" }}>+{awards.length - 5} more</li>
                  )}
                </ul>
              </div>
            ) : (
              <p style={{ color: "#9ca3af", margin: 0 }}>No awards data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

// import React from "react";

// const MovieCard = ({ movie }) => {
//   return (
//     <div className="movie-card" style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
//       {movie.poster && <img src={movie.poster} alt={movie.primaryTitle} style={{ width: "100%", borderRadius: "4px" }} />}
//       <h3>{movie.primaryTitle}</h3>
//       <p>Year: {movie.startYear}</p>
//       <p>Rating: {movie.averageRating}</p>
//       <p>Runtime: {movie.runtimeMinutes} mins</p>
//       {movie.director && <p>Director: {movie.director}</p>}
//       {movie.actors && <p>Actors: {movie.actors.join(", ")}</p>}
//     </div>
//   );
// };

// export default MovieCard;
