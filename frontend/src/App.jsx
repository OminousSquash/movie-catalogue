import { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import AppRoutes from "./AppRoutes";
import NavBar from "./components/NavBar";
import LoginSignup from "./pages/LoginSignup";
import { logout } from "./services/authService";
import { useNavigate } from "react-router-dom";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  return (
    <>
      <NavBar
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <AppRoutes isAuthenticated={isAuthenticated} />

      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <LoginSignup
              embedded
              onCancel={() => setAuthOpen(false)}
              onAuthSuccess={() => {
                setAuthOpen(false);
                handleAuthSuccess();
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
