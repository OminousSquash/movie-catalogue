import React, { useState, useEffect } from "react";
import { AppBar, Box, Button, Dialog, DialogContent, Toolbar, Typography } from "@mui/material";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import FilterPanel from "../components/dashboard/FilterPanel";
import MovieCard from "../components/dashboard/MovieCard";
import { searchMovies, getRecentMovies } from "../services/movieService";
import LoginSignup from "./LoginSignup";

const Dashboard = ({ isAuthenticated, onAuthSuccess, onLogout }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

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
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Movie Catalogue
          </Typography>
          {!isAuthenticated ? (
            <Button color="inherit" onClick={() => setAuthOpen(true)}>
              Login / Sign Up
            </Button>
          ) : (
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <DashboardLayout
        children={{
          filters: <FilterPanel onSearch={handleSearch} />,
          content: loading ? <p>Loading...</p> : movieCards,
        }}
      />

      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <LoginSignup
              embedded
              onCancel={() => setAuthOpen(false)}
              onAuthSuccess={() => {
                setAuthOpen(false);
                onAuthSuccess?.();
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
