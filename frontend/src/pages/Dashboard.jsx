import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies } from "../services/movieService";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastFilters = useRef({});

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const data = await getRecentMovies();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch recent movies", err);
    }
    setLoading(false);
  };

  const handleSearch = async (filters, page=1) => {
    setLoading(true);
    lastFilters.current = filters;
    try {
      const result = await searchMovies(filters, page);
      setMovies(result.data ?? []);
      setCurrentPage(result.page ?? 1);
      setTotalPages(result.total_pages ?? 1);
    } catch (err) {
      console.error("Search failed", err);
      setMovies([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handlePrev = () => {
    if (currentPage > 1) handleSearch(lastFilters.current, currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) handleSearch(lastFilters.current, currentPage + 1);
  };

  const content = movies.length ? (
    <>
      {movies.map((m) => <MovieCard key={m.tconst} movie={m} />)}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
          <button onClick={handlePrev} disabled={currentPage <= 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage >= totalPages}>Next</button>
        </div>
      )}
    </>
  ) : (
    <p>No Results Yet</p>
  );

  return (
    <DashboardLayout
      children={{
        filters: <FilterPanel onSearch={handleSearch} />,
        content: loading ? <p>Loading...</p> : content,
      }}
    />
  );
};

export default Dashboard;
