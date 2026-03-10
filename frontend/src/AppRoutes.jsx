import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserLists from "./pages/UserLists";
import ViewLists from "./pages/ViewLists";
import ViewerRatingAnalysis from "./pages/ViewerRatingAnalysisPage";
import PredictedRatings from "./pages/PredictedRatings";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/user-lists"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UserLists />
          </ProtectedRoute>
        }
      />
      <Route path="/view-lists" element={<ViewLists />} />
      <Route path="/viewer-rating-analysis" element={<ViewerRatingAnalysis />} />
      <Route path="/predicted-ratings" element={<PredictedRatings />} />
    </Routes>
  );
}

export default AppRoutes;
