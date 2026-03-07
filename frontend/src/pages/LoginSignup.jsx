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
} from "@mui/material";
import { login, signup } from "../services/authService";
import "./LoginSignup.css";

export default function LoginSignup({ onAuthSuccess, embedded = false, onCancel }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      onAuthSuccess?.();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Request failed. Please try again.");
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

  if (embedded) {
    return <Box>{authForm}</Box>;
  }

  return (
    <Container maxWidth="sm" className="login-signup-container">
      <Paper elevation={6} className="login-signup-paper">
        {authForm}
      </Paper>
    </Container>
  );
}
