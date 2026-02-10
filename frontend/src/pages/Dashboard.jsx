import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies } from "../services/movieService";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const data = await searchMovies(filters);
      setMovies(data);
    } catch (err) {
      console.error("Search failed", err);
      setMovies([]);
    }
    setLoading(false);
  };

  const movieCards = movies.length ? (
    movies.map((m) => <MovieCard key={m.tconst} movie={m} />)
  ) : (
    <p>No results yet</p>
  );

  return (
    <DashboardLayout
      children={{
        filters: <FilterPanel onSearch={handleSearch} />,
        content: loading ? <p>Loading...</p> : movieCards,
      }}
    />
  );
};

export default Dashboard;
