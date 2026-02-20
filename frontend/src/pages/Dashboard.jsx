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
  const [activeFilters, setActiveFilters] = useState(null);

  useEffect(() => { fetchRecent(); }, []);

  const fetchRecent = async () => {
    setLoading(true); setError(null);
    setActiveFilters(null); setCurrentPage(1); setTotalPages(0); setTotal(0);
    try {
      const data = await getRecentMovies();
      setMovies(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load recent movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters, page = 1) => {
    setLoading(true); setError(null);
    setActiveFilters(filters); setCurrentPage(page);
    try {
      const result = await searchMovies(filters, page);
      setMovies(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.total_pages || 0);
    } catch {
      setError("Search failed. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (p) => { if (activeFilters) handleSearch(activeFilters, p); };

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "2px solid var(--border)",
            borderTopColor: "var(--gold)",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <div style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            LOADING
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (error) return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--red)", fontSize: "13px" }}>
        {error}
      </div>
    );

    if (!movies.length) return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--text-muted)", marginBottom: "8px" }}>
          No results
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Try adjusting your filters
        </div>
      </div>
    );

    return (
      <>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              color: "var(--text-primary)",
              marginRight: "10px",
            }}>
              {activeFilters ? "Results" : "Recently Released"}
            </span>
            {activeFilters && (
              <span style={{ fontSize: "12px", color: "var(--gold)" }}>
                {total.toLocaleString()} titles
              </span>
            )}
          </div>
          {activeFilters && totalPages > 1 && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              PAGE {currentPage} / {totalPages}
            </span>
          )}
        </div>

        {movies.map(m => <MovieCard key={m.tconst} movie={m} />)}

        {activeFilters && totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
          }}>
            <PaginationBtn
              label="←"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} style={{ color: "var(--text-muted)", padding: "0 4px", fontSize: "12px" }}>…</span>
              ) : (
                <PaginationBtn
                  key={p}
                  label={p}
                  onClick={() => handlePageChange(p)}
                  active={p === currentPage}
                />
              )
            )}
            <PaginationBtn
              label="→"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <DashboardLayout children={{
      filters: <FilterPanel onSearch={handleSearch} onReset={fetchRecent} />,
      content: renderContent(),
    }} />
  );
};

const PaginationBtn = ({ label, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: "32px",
      height: "32px",
      padding: "0 8px",
      borderRadius: "var(--radius-sm)",
      border: active ? "1px solid var(--gold)" : "1px solid var(--border)",
      background: active ? "var(--gold-glow)" : "transparent",
      color: active ? "var(--gold)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
      fontSize: "12px",
      fontWeight: active ? 600 : 400,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.1s",
      fontFamily: "var(--font-body)",
    }}
    onMouseOver={e => { if (!disabled && !active) e.currentTarget.style.borderColor = "var(--border-light)"; }}
    onMouseOut={e => { if (!disabled && !active) e.currentTarget.style.borderColor = "var(--border)"; }}
  >
    {label}
  </button>
);

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current > 3) pages.push(1, "...");
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
  if (current < total - 2) pages.push("...", total);
  return pages;
};

export default Dashboard;