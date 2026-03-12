import { useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SectionHeader from "../components/SectionHeader";
import Surface from "../components/Surface";
import { getLowRatingGenres } from "../services/viewerRatingService";

export default function ViewerRatingLowRatedGenres() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const result = await getLowRatingGenres();
                if (!cancelled) {
                    setData(Array.isArray(result) ? result : []);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err?.response?.data?.detail || "Failed to load low-rating genre data.");
                    setData([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadData();
        return () => {
            cancelled = true;
        };
    }, []);

    const maxCount = Math.max(...data.map((item) => item.num_users_with_low_preference), 0);

    return (
        <Surface minHeight={420}>
            <SectionHeader
                icon={<ThumbDownAltOutlinedIcon sx={{ color: "primary.main" }} />}
                title="Genres With Repeated Low Ratings"
                subtitle="Counts users whose ratings in a genre are low more than half the time."
                chip={data.length ? `${data.length} genres` : null}
            />

            {loading ? <LoadingState height={280} /> : null}
            {!loading && error ? <Alert severity="error">{error}</Alert> : null}
            {!loading && !error && !data.length ? (
                <EmptyState message="No low-rating genre data available." height={280} />
            ) : null}

            {!loading && !error && data.length ? (
                <Stack spacing={1.5}>
                    {data.map((row, index) => {
                        const width = maxCount ? (row.num_users_with_low_preference / maxCount) * 100 : 0;
                        return (
                            <Box key={row.genre}>
                                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.6 }}>
                                    <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 500 }}>
                                        {row.genre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.num_users_with_low_preference.toLocaleString()} users
                                    </Typography>
                                </Stack>
                                <Box
                                    sx={{
                                        height: 12,
                                        background: "rgba(255,255,255,0.04)",
                                        borderRadius: 999,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${width}%`,
                                            height: "100%",
                                            borderRadius: 999,
                                            background:
                                                "linear-gradient(90deg, rgba(126,158,232,0.85), rgba(232,201,126,0.9))",
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            ) : null}
        </Surface>
    );
}