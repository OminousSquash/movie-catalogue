import { useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SectionHeader from "../components/SectionHeader";
import Surface from "../components/Surface";
import { getViewerHarshness } from "../services/viewerRatingService";

const RATERS = ["Harsh", "Moderate", "Generous"];

const TYPE_COLORS = {
    Harsh: "linear-gradient(90deg, rgba(210,94,74,0.95), rgba(210,94,74,0.45))",
    Moderate: "linear-gradient(90deg, rgba(126,158,232,0.9), rgba(126,158,232,0.38))",
    Generous: "linear-gradient(90deg, rgba(232,201,126,0.95), rgba(232,201,126,0.45))",
};

export default function ViewerRatingGeneralStats() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const result = await getViewerHarshness();
                if (!cancelled) {
                    setData(Array.isArray(result) ? result : []);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setData([]);
                    setError(err?.response?.data?.detail || "Failed to load viewer harshness data.");
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

    const totalUsers = data.reduce((sum, item) => sum + item.num_users, 0);
    const rows = RATERS.map(
        (label) => data.find((item) => item.rater_type === label) || { rater_type: label, num_users: 0 }
    );

    return (
        <Surface minHeight={300}>
            <SectionHeader
                icon={<InsightsIcon sx={{ color: "primary.main" }} />}
                title="Viewer Harshness"
                subtitle="Users are grouped by their average rating behaviour across the full ratings dataset."
                chip={totalUsers ? `${totalUsers.toLocaleString()} users profiled` : null}
            />

            {loading ? <LoadingState /> : null}
            {!loading && error ? <Alert severity="error">{error}</Alert> : null}
            {!loading && !error && !rows.length ? <EmptyState message="No viewer harshness data available." /> : null}

            {!loading && !error && rows.length ? (
                <Stack spacing={2.25}>
                    {rows.map((row) => {
                        const pct = totalUsers ? (row.num_users / totalUsers) * 100 : 0;
                        return (
                            <Box key={row.rater_type}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {row.rater_type}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {row.num_users.toLocaleString()} users · {pct.toFixed(1)}%
                                    </Typography>
                                </Stack>
                                <Box sx={{ height: 16, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                    <Box
                                        sx={{
                                            width: `${pct}%`,
                                            height: "100%",
                                            borderRadius: 999,
                                            background: TYPE_COLORS[row.rater_type],
                                            minWidth: row.num_users ? 12 : 0,
                                            transition: "width 0.4s ease",
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