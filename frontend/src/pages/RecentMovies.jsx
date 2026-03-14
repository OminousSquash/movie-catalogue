import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { getRecentMovies } from "../services/movieService";
import MovieCard from "../components/dashboard/MovieCard";
import { addMovieToList, formatApiErrorDetail, getMyLists } from "../services/userListService";

export default function RecentMovies({ isAuthenticated = false }) {
    const [recentMovies, setRecentMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [myLists, setMyLists] = useState([]);
    const [listsLoaded, setListsLoaded] = useState(false);
    const [listPickerAnchorEl, setListPickerAnchorEl] = useState(null);
    const [activeMovieTconst, setActiveMovieTconst] = useState(null);
    const [listPickerLoading, setListPickerLoading] = useState(false);
    const [addingToListId, setAddingToListId] = useState(null);

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

    const handleOpenAddMenu = async (event, movie) => {
        if (!isAuthenticated) {
            return;
        }

        setMessage({ type: "", text: "" });
        setActiveMovieTconst(movie.tconst);
        setListPickerAnchorEl(event.currentTarget);

        if (!listsLoaded) {
            setListPickerLoading(true);
            try {
                const lists = await getMyLists();
                setMyLists(lists || []);
                setListsLoaded(true);
            } catch (err) {
                setMessage({
                    type: "error",
                    text: formatApiErrorDetail(err, "Failed to load your lists."),
                });
            } finally {
                setListPickerLoading(false);
            }
        }
    };

    const handleCloseAddMenu = () => {
        setListPickerAnchorEl(null);
        setActiveMovieTconst(null);
        setAddingToListId(null);
    };

    const handleAddMovieToList = async (listId) => {
        if (!activeMovieTconst) {
            return;
        }

        setAddingToListId(listId);
        try {
            const result = await addMovieToList(listId, activeMovieTconst);
            setMessage({ type: "success", text: result?.message || "Movie added successfully." });
            handleCloseAddMenu();
        } catch (err) {
            setMessage({
                type: "error",
                text: formatApiErrorDetail(err, "Failed to add movie to list."),
            });
            setAddingToListId(null);
        }
    };

    useEffect(() => {
        fetchRecent();
    }, []);

    const content = loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <CircularProgress color="primary" size={36} thickness={2.5} />
        </Box>
    ) : (
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

            {message.text ? (
                <Alert severity={message.type || "info"} sx={{ mb: 1.5 }}>
                    {message.text}
                </Alert>
            ) : null}

            {error ? (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                    {error}
                </Alert>
            ) : null}

            {!error && recentMovies.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "45vh",
                        gap: 1.5,
                        opacity: 0.35,
                    }}
                >
                    <Typography sx={{ fontSize: "3.5rem" }}>🎞</Typography>
                    <Typography variant="body2" color="text.secondary">
                        No recent movies available right now.
                    </Typography>
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
    );

    return (
        <>
            {content}
            <Menu
                anchorEl={listPickerAnchorEl}
                open={Boolean(listPickerAnchorEl)}
                onClose={handleCloseAddMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{
                    "& .MuiPaper-root": {
                        background: "#16161a",
                        border: "1px solid rgba(232,201,126,0.15)",
                        minWidth: 220,
                    },
                }}
            >
                {listPickerLoading ? (
                    <MenuItem disabled>Loading lists...</MenuItem>
                ) : myLists.length === 0 ? (
                    <MenuItem disabled>No lists available</MenuItem>
                ) : (
                    myLists.map((list) => (
                        <MenuItem
                            key={list.list_id}
                            onClick={() => handleAddMovieToList(list.list_id)}
                            disabled={Boolean(addingToListId)}
                        >
                            {addingToListId === list.list_id ? "Adding..." : list.list_name}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}
