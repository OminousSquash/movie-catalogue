import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { getRecentMovies } from "../services/movieService";
import MovieCard from "../components/dashboard/MovieCard";
import { useAddToList } from "../hooks/useAddToList";
import ListPickerMenu from "../components/ListPickerMenu";

export default function RecentMovies({ isAuthenticated = false }) {
    const [recentMovies, setRecentMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        message, addingToListId, listPickerAnchorEl, listPickerLoading,
        myLists, handleOpenAddMenu, handleCloseAddMenu, handleAddMovieToList,
    } = useAddToList();

    useEffect(() => {
        const fetchRecent = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getRecentMovies();
                setRecentMovies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch recent movies", err);
                setError("Failed to fetch recent movies.");
                setRecentMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress color="primary" size={36} thickness={2.5} />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h4"
                        sx={{ color: "text.primary", mb: 0.5 }}
                    >
                        Recent Movies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Recently predicted titles from the catalogue, displayed using the same movie row layout as the dashboard.
                    </Typography>
                </Box>

                {message.text && (
                    <Alert severity={message.type || "info"} sx={{ mb: 1.5 }}>{message.text}</Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>
                )}

                {!error && recentMovies.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "45vh", gap: 1.5, opacity: 0.35 }}>
                        <Typography sx={{ fontSize: "3.5rem" }}>🎞</Typography>
                        <Typography variant="body2" color="text.secondary">No recent movies available right now.</Typography>
                    </Box>
                ) : (
                    recentMovies.map((movie) => (
                        <MovieCard
                            key={movie.tconst}
                            movie={movie}
                            isAuthenticated={isAuthenticated}
                            onAddClick={handleOpenAddMenu}
                            isAddBusy={Boolean(addingToListId)}
                        />
                    ))
                )}
            </Box>

            <ListPickerMenu
                anchorEl={listPickerAnchorEl}
                onClose={handleCloseAddMenu}
                lists={myLists}
                loading={listPickerLoading}
                addingToListId={addingToListId}
                onSelect={handleAddMovieToList}
            />
        </>
    );
}