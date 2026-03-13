import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Slider,
} from "@mui/material";
import { login, signup } from "../services/authService";
import { savePersonality } from "../services/appUserDetailsService";
import "./LoginSignup.css";

export default function LoginSignup({ onAuthSuccess, embedded = false, onCancel }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    "Openness": 5,
    "Agreeableness": 5,
    "Emotional Stability": 5,
    "Conscientiousness": 5,
    "Extraversion": 5,
  });
  const [showPersonality, setShowPersonality] = useState(false);

  const handleModeChange = (_, newMode) => {
    if (!newMode) {
      return;
    }
    setMode(newMode);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { username: username.trim(), password };
      const response = mode === "login" ? await login(payload) : await signup(payload);
      if (!response.access_token) {
        throw new Error("No access token returned.");
      }
      localStorage.setItem("access_token", response.access_token);
      if (mode === "signup"){
        setShowPersonality(true);
      } else {
        onAuthSuccess?.();
      }

    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handlePersonalitySubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    await savePersonality(ratings);
    onAuthSuccess?.();
  } catch (err) {
    setError("Failed to submit. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const authForm = (
    <>
        <Typography variant="h5" className="login-signup-title" gutterBottom>
          Account
        </Typography>
        <Typography variant="body2" color="text.secondary" className="login-signup-subtitle">
          {mode === "login" ? "Sign in to continue." : "Create a new account."}
        </Typography>

        <Tabs value={mode} onChange={handleModeChange} className="login-signup-tabs">
          <Tab value="login" label="Login" />
          <Tab value="signup" label="Sign Up" />
        </Tabs>

        {error ? (
          <Alert severity="error" className="login-signup-alert">
            {error}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError("");
            }}
            margin="normal"
            fullWidth
            required
            autoComplete="username"
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
            margin="normal"
            fullWidth
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <Button type="submit" variant="contained" fullWidth disabled={loading} className="login-signup-submit">
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </Button>
          {embedded ? (
            <Button type="button" variant="text" fullWidth className="login-signup-cancel" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </Box>
    </>
  );

  const personalityForm = (
    <>
      <Typography variant="h5" className="login-signup-title" gutterBottom>
        Welcome!
      </Typography>
      <Typography variant="body2" color="text.secondary" className="login-signup-subtitle">
        Please rate yourself from 1–10 in each of the following traits.
      </Typography>

      {error ? (
        <Alert severity="error" className="login-signup-alert">
          {error}
        </Alert>
      ) : null}

      <Box component="form" onSubmit={handlePersonalitySubmit}>
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

        <Button type="submit" variant="contained" fullWidth disabled={loading} className="login-signup-submit">
          {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
        </Button>
      </Box>
    </>
  );

  if (embedded) {
    return <Box>{showPersonality ? personalityForm : authForm}</Box>;
  }

  return (
    <Container maxWidth="sm" className="login-signup-container">
      <Paper elevation={6} className="login-signup-paper">
        {showPersonality ? personalityForm : authForm}
      </Paper>
    </Container>
  );
}