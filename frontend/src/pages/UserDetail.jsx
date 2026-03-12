import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export default function Account({ isAuthenticated }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [ratings, setRatings] = useState({
    "Openness": 5,
    "Agreeableness": 5,
    "Emotional Stability": 5,
    "Conscientiousness": 5,
    "Extraversion": 5,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // fetch current user details on load
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get("/account/details", {
          headers: getAuthHeaders(),
        });
        const data = response.data;
        setUsername(data.app_username);
        setRatings({
          Openness: data.openness ?? 5,
          Agreeableness: data.agreeableness ?? 5,
          "Emotional Stability": data.emotional_stability ?? 5,
          Conscientiousness: data.conscientiousness ?? 5,
          Extraversion: data.extraversion ?? 5,
        });
      } catch (err) {
        setError("Failed to load user details.");
      }
    };
    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.put(
        "/account/update",
        {
          app_username: username.trim(),
          openness: parseInt(ratings["Openness"]),
          agreeableness: parseInt(ratings["Agreeableness"]),
          emotional_stability: parseInt(ratings["Emotional Stability"]),
          conscientiousness: parseInt(ratings["Conscientiousness"]),
          extraversion: parseInt(ratings["Extraversion"]),
        },
        { headers: getAuthHeaders() }
      );
      setSuccess("Changes saved successfully!");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Account Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your username and personality traits below.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="username"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Personality Traits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Rate yourself from 1–10 in each trait.
          </Typography>

          {["Openness", "Agreeableness", "Emotional Stability", "Conscientiousness", "Extraversion"].map((trait) => (
            <Box key={trait} sx={{ mb: 2 }}>
              <Typography variant="body1">{trait}</Typography>
              <Slider
                value={ratings[trait] ?? 5}
                onChange={(_, newValue) => setRatings((prev) => ({ ...prev, [trait]: newValue }))}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          ))}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Confirm Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}