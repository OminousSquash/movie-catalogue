import { useState } from "react";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  return (
    <Dashboard
      isAuthenticated={isAuthenticated}
      onAuthSuccess={handleAuthSuccess}
      onLogout={handleLogout}
    />
  );
}

export default App;
