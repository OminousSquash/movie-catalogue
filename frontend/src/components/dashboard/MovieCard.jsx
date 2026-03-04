import React, { useEffect, useState } from "react";
import { getMoviePoster, getMovieAwards } from "../../services/movieService";

const PLACEHOLDER = "https://via.placeholder.com/80x120/1e2026/5c5850?text=No+Image";

const MovieCard = ({ movie }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [awards, setAwards] = useState(null);
  const [awardsLoading, setAwardsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMoviePoster(movie.tconst)
      .then(url => { if (!cancelled) { setPosterUrl(url); setPosterLoading(false); } })
      .catch(() => { if (!cancelled) setPosterLoading(false); });
    return () => { cancelled = true; };
  }, [movie.tconst]);

  const handleExpand = () => {
    setExpanded(prev => !prev);
    if (!expanded && awards === null) {
      setAwardsLoading(true);
      getMovieAwards(movie.tconst)
        .then(setAwards)
        .catch(() => setAwards([]))
        .finally(() => setAwardsLoading(false));
    }
  };

  const ratingBar = movie.averageRating ? Math.round(movie.averageRating) : 0;

  return (
    <div style={{
      display: "flex",
      gap: "14px",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "14px",
      marginBottom: "8px",
      transition: "border-color 0.15s, background 0.15s",
      cursor: "default",
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
    >

      <div style={{
        flexShrink: 0,
        width: "72px",
        height: "108px",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        background: "var(--bg-raised)",
      }}>
        {!posterLoading && (
          <img
            src={posterUrl || PLACEHOLDER}
            alt={movie.primaryTitle}
            style={{ width: "72px", height: "108px", objectFit: "cover", display: "block" }}
            onError={e => { e.target.src = PLACEHOLDER; }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontWeight: 400,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              minWidth: 0,
            }}>
              {movie.primaryTitle}
            </h3>
            {movie.startYear && (
              <span style={{
                flexShrink: 0,
                fontSize: "11px",
                color: "var(--text-muted)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {movie.startYear}
              </span>
            )}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}>
            {movie.runtimeMinutes && (
              <span>{movie.runtimeMinutes} min</span>
            )}
            {movie.averageRating && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {/* Rating blocks — 10 small squares */}
                <span style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} style={{
                      display: "inline-block",
                      width: "5px",
                      height: "8px",
                      borderRadius: "1px",
                      background: i < ratingBar ? "var(--gold)" : "var(--bg-hover)",
                      transition: "background 0.1s",
                    }} />
                  ))}
                </span>
                <span style={{ color: "var(--gold)", fontWeight: 500 }}>
                  {movie.averageRating}
                </span>
                {movie.numVotes && (
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    ({movie.numVotes.toLocaleString()})
                  </span>
                )}
              </span>
            )}
          </div>

          {movie.genres?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
              {movie.genres.map(g => (
                <span key={g} style={{
                  background: "var(--blue-pill)",
                  color: "var(--blue-pill-text)",
                  borderRadius: "9999px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleExpand} style={{
          alignSelf: "flex-start",
          fontSize: "11px",
          color: "var(--text-muted)",
          background: "none",
          border: "none",
          padding: 0,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontWeight: 500,
          transition: "color 0.1s",
        }}
          onMouseOver={e => e.target.style.color = "var(--gold)"}
          onMouseOut={e => e.target.style.color = "var(--text-muted)"}
        >
          {expanded ? "▲ Hide" : "▼ Awards"}
        </button>

        {expanded && (
          <div style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid var(--border)",
            fontSize: "12px",
          }}>
            {awardsLoading ? (
              <span style={{ color: "var(--text-muted)" }}>Loading...</span>
            ) : awards?.length > 0 ? (
              <ul style={{ paddingLeft: "14px", listStyle: "disc" }}>
                {awards.slice(0, 5).map((a, i) => (
                  <li key={i} style={{ color: "var(--text-secondary)", marginBottom: "3px" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 500 }}>{a.event}</span>
                    {" — "}{a.type}: {a.award}
                    {a.all_recipients?.length > 0 && (
                      <span style={{ color: "var(--text-muted)" }}> · {a.all_recipients.join(", ")}</span>
                    )}
                  </li>
                ))}
                {awards.length > 5 && (
                  <li style={{ color: "var(--text-muted)" }}>+{awards.length - 5} more</li>
                )}
              </ul>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>No awards data available.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;