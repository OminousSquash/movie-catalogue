import { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";
import AppRoutes from "./AppRoutes";
import NavBar from "./components/NavBar";
import LoginSignup from "./pages/LoginSignup";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );
  const [authOpen, setAuthOpen] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // MAKE POSSIBLE CHANGES HERE, CREATE A POP UP WHICH PROMPTS USERS TO SELECT FROM 0 to 10 ON EACH FIELD.
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
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
