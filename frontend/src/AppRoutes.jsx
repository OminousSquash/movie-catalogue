import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserLists from "./pages/UserLists";
import ViewLists from "./pages/ViewLists";
import ListDetails from "./pages/ListDetails";
import MovieDetails from "./pages/MovieDetails";
import ContributorDetails from "./pages/ContributorDetails";
import PersonalityTraits from "./pages/personalityTraits";
import RecentMovies from "./pages/RecentMovies";
import Account from "./pages/UserDetail";
import ViewerRatingStatistics from "./pages/ViewerRatingStatistics";


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
      <Route path="/personality" element={<PersonalityTraits />} />
      <Route path="/viewer-ratings" element={<ViewerRatingStatistics />} />
      <Route
        path="/user-lists"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UserLists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Account isAuthenticated={isAuthenticated} />
          </ProtectedRoute>
        }
      />
      <Route path="/view-lists" element={<ViewLists />} />
      <Route path="/lists/:listId" element={<ListDetails />} />
      <Route path="/movies/:tconst" element={<MovieDetails />} />
      <Route path="/contributors/:nconst" element={<ContributorDetails />} />
      <Route path="/recent_movies" element={<RecentMovies isAuthenticated={isAuthenticated} />} />
    </Routes>
  );
}

export default AppRoutes;
