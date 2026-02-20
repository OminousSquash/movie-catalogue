// Dashboard.jsx

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies } from "../services/movieService";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null); // null = recent mode

  // Load recent movies on mount
  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoading(true);
    setError(null);
    setActiveFilters(null);
    setCurrentPage(1);
    setTotalPages(0);
    setTotal(0);
    try {
      const data = await getRecentMovies();
      // getRecentMovies returns an array directly
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load recent movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters, page = 1) => {
    setLoading(true);
    setError(null);
    setActiveFilters(filters);
    setCurrentPage(page);
    try {
      const result = await searchMovies(filters, page);
      // searchMovies returns { data, page, page_size, total, total_pages }
      setMovies(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.total_pages || 0);
    } catch (err) {
      setError("Search failed. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (activeFilters) {
      handleSearch(activeFilters, newPage);
    }
  };

  const handleReset = () => {
    fetchRecent();
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
          {error}
        </div>
      );
    }

    if (!movies.length) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          No results found. Try adjusting your filters.
        </div>
      );
    }

    return (
      <>
        {/* Result count and heading */}
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#374151" }}>
            {activeFilters ? `${total.toLocaleString()} results` : "Recently Released"}
          </h2>
          {activeFilters && totalPages > 1 && (
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Movie list */}
        {movies.map((m) => (
          <MovieCard key={m.tconst} movie={m} />
        ))}

        {/* Pagination */}
        {activeFilters && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={paginationBtnStyle(currentPage === 1)}
            >
              ← Prev
            </button>

            {/* Show page numbers around current page */}
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} style={{ padding: "6px 4px", color: "#9ca3af" }}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  style={paginationBtnStyle(false, p === currentPage)}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={paginationBtnStyle(currentPage === totalPages)}
            >
              Next →
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <DashboardLayout
      children={{
        filters: <FilterPanel onSearch={handleSearch} onReset={handleReset} />,
        content: renderContent(),
      }}
    />
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const paginationBtnStyle = (disabled, active = false) => ({
  padding: "6px 12px",
  borderRadius: "4px",
  border: "1px solid #e5e7eb",
  cursor: disabled ? "not-allowed" : "pointer",
  backgroundColor: active ? "#2563eb" : disabled ? "#f9fafb" : "#fff",
  color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
  fontSize: "13px",
  fontWeight: active ? "600" : "400",
});

// Generate page numbers with ellipsis for large page counts
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current > 3) { pages.push(1, "..."); }
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i);
  }
  if (current < total - 2) { pages.push("...", total); }
  return pages;
};

export default Dashboard;

// import React, { useState, useEffect } from "react";
// import DashboardLayout from "../components/dashboard/DashboardLayout";
// import FilterPanel from "../components/dashboard/FilterPanel";
// import MovieCard from "../components/dashboard/MovieCard";
// import { searchMovies, getRecentMovies } from "../services/movieService";

// const Dashboard = () => {
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchRecent();
//   }, []);

//   const fetchRecent = async () => {
//     setLoading(true);
//     try {
//       const data = await getRecentMovies();
//       setMovies(data);
//     } catch (err) {
//       console.error("Failed to fetch recent movies", err);
//     }
//     setLoading(false);
//   };

//   const handleSearch = async (filters) => {
//     setLoading(true);
//     try {
//       const data = await searchMovies(filters);
//       setMovies(data);
//     } catch (err) {
//       console.error("Search failed", err);
//       setMovies([]);
//     }
//     setLoading(false);
//   };

//   const movieCards = movies.length ? (
//     movies.map((m) => <MovieCard key={m.tconst} movie={m} />)
//   ) : (
//     <p>No results yet</p>
//   );

//   return (
//     <DashboardLayout
//       children={{
//         filters: <FilterPanel onSearch={handleSearch} />,
//         content: loading ? <p>Loading...</p> : movieCards,
//       }}
//     />
//   );
// };

// export default Dashboard;
