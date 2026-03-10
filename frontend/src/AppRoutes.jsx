import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserLists from "./pages/UserLists";
import ViewLists from "./pages/ViewLists";
import ListDetails from "./pages/ListDetails";
import MovieDetails from "./pages/MovieDetails";
import ContributorDetails from "./pages/ContributorDetails";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard isAuthenticated={isAuthenticated} />} />
      <Route
        path="/user-lists"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UserLists />
          </ProtectedRoute>
        }
      />
      <Route path="/view-lists" element={<ViewLists />} />
      <Route path="/lists/:listId" element={<ListDetails />} />
      <Route path="/movies/:tconst" element={<MovieDetails />} />
      <Route path="/contributors/:nconst" element={<ContributorDetails />} />
    </Routes>
  );
}

export default AppRoutes;
