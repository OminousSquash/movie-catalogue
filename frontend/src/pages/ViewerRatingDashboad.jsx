import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import {
    getConditionalHighRating,
    getConditionalLowRating,
    getGenreCorrelationMatrix,
    getLowRatingGenres,
    getViewerHarshness,
} from "../services/viewerRatingService";
import ViewerRatingCorrelationHeatmap from "../components/ViewerRatingCorrelationHeatmap.jsx";

const RATERS = ["Harsh", "Moderate", "Generous"];

const TYPE_COLORS = {
    Harsh: "linear-gradient(90deg, rgba(210,94,74,0.95), rgba(210,94,74,0.45))",
    Moderate: "linear-gradient(90deg, rgba(126,158,232,0.9), rgba(126,158,232,0.38))",
    Generous: "linear-gradient(90deg, rgba(232,201,126,0.95), rgba(232,201,126,0.45))",
};

function SectionHeader({ icon, title, subtitle, chip }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {icon}
                    <Box>
                        <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif" }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>
                {chip ? (
                    <Chip
                        label={chip}
                        size="small"
                        sx={{
                            color: "primary.main",
                            background: "rgba(232,201,126,0.08)",
                            border: "1px solid rgba(232,201,126,0.18)",
                        }}
                    />
                ) : null}
            </Stack>
        </Box>
    );
}

function Surface({ children, minHeight }) {
    return (
        <Box
            sx={{
                border: "1px solid rgba(232,201,126,0.1)",
                borderRadius: 2,
                background:
                    "radial-gradient(circle at top left, rgba(232,201,126,0.08), transparent 30%), #141418",
                p: { xs: 2, md: 3 },
                minHeight,
            }}
        >
            {children}
        </Box>
    );
}

function LoadingState({ height = 220 }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: height }}>
            <CircularProgress color="primary" size={32} thickness={2.5} />
        </Box>
    );
}

function EmptyState({ message, height = 220 }) {
    return (
        <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: height, opacity: 0.65 }}
        >
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
}

function HarshnessChart({ data, loading, error }) {
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
            {error ? <Alert severity="error">{error}</Alert> : null}
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
                                <Box
                                    sx={{
                                        height: 16,
                                        borderRadius: 999,
                                        background: "rgba(255,255,255,0.05)",
                                        overflow: "hidden",
                                    }}
                                >
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

function LowRatingGenresChart({ data, loading, error }) {
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
            {error ? <Alert severity="error">{error}</Alert> : null}
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

function ProbabilityMeter({ label, probability, color, sampleSize }) {
    const pct = Math.max(0, Math.min(probability * 100, 100));

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {(probability * 100).toFixed(1)}% · n={sampleSize.toLocaleString()}
                </Typography>
            </Stack>
            <Box sx={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                <Box
                    sx={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: color,
                    }}
                />
            </Box>
        </Box>
    );
}

function PairExplorer({
    genres,
    lowData,
    highData,
    loading,
    error,
    genreA,
    genreB,
    onGenreAChange,
    onGenreBChange,
}) {
    return (
        <Surface minHeight={380}>
            <SectionHeader
                icon={<CompareArrowsOutlinedIcon sx={{ color: "primary.main" }} />}
                title="Genre Pair Explorer"
                subtitle="Compare whether users who love or dislike one genre are likely to behave the same way in another."
                chip={genreA && genreB ? `${genreA} -> ${genreB}` : null}
            />

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Base genre</InputLabel>
                        <Select value={genreA} label="Base genre" onChange={(event) => onGenreAChange(event.target.value)}>
                            {genres.map((genre) => (
                                <MenuItem key={genre} value={genre}>
                                    {genre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Compared genre</InputLabel>
                        <Select
                            value={genreB}
                            label="Compared genre"
                            onChange={(event) => onGenreBChange(event.target.value)}
                        >
                            {genres.map((genre) => (
                                <MenuItem key={genre} value={genre}>
                                    {genre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {loading ? <LoadingState height={180} /> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {!loading && !error && (!lowData || !highData) ? (
                <EmptyState message="Select two genres to load conditional probabilities." height={180} />
            ) : null}

            {!loading && !error && lowData && highData ? (
                <Stack spacing={2.25}>
                    <ProbabilityMeter
                        label={`P(low in ${highData.genre_b} | low in ${highData.genre_a})`}
                        probability={lowData.probability}
                        sampleSize={lowData.sample_size}
                        color="linear-gradient(90deg, rgba(210,94,74,0.85), rgba(126,158,232,0.75))"
                    />
                    <ProbabilityMeter
                        label={`P(high in ${highData.genre_b} | high in ${highData.genre_a})`}
                        probability={highData.probability}
                        sampleSize={highData.sample_size}
                        color="linear-gradient(90deg, rgba(232,201,126,0.9), rgba(126,158,232,0.55))"
                    />
                    <Divider />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, borderRadius: 1.5, background: "rgba(255,255,255,0.03)" }}>
                                <Typography variant="caption" color="text.secondary">
                                    Negative carry-over
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 0.4, fontFamily: "Playfair Display, serif" }}>
                                    {(lowData.probability * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                    Users who frequently rate {genreA} poorly and do the same for {genreB}.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, borderRadius: 1.5, background: "rgba(255,255,255,0.03)" }}>
                                <Typography variant="caption" color="text.secondary">
                                    Positive carry-over
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 0.4, fontFamily: "Playfair Display, serif" }}>
                                    {(highData.probability * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                    Users who strongly like {genreA} and also strongly like {genreB}.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Stack>
            ) : null}
        </Surface>
    );
}

export default function ViewerRatingDashboard() {
    const [harshness, setHarshness] = useState([]);
    const [lowGenres, setLowGenres] = useState([]);
    const [correlationMatrix, setCorrelationMatrix] = useState({});
    const [genres, setGenres] = useState([]);
    const [genreA, setGenreA] = useState("");
    const [genreB, setGenreB] = useState("");
    const [conditionalLow, setConditionalLow] = useState(null);
    const [conditionalHigh, setConditionalHigh] = useState(null);
    const [loading, setLoading] = useState({
        harshness: true,
        lowGenres: true,
        correlation: true,
        pair: false,
    });
    const [errors, setErrors] = useState({
        harshness: "",
        lowGenres: "",
        correlation: "",
        pair: "",
    });

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            const requests = [
                {
                    key: "harshness",
                    run: getViewerHarshness,
                    onSuccess: (data) => setHarshness(Array.isArray(data) ? data : []),
                },
                {
                    key: "lowGenres",
                    run: getLowRatingGenres,
                    onSuccess: (data) => setLowGenres(Array.isArray(data) ? data : []),
                },
                {
                    key: "correlation",
                    run: getGenreCorrelationMatrix,
                    onSuccess: (data) => {
                        const matrix = data && typeof data === "object" ? data : {};
                        const nextGenres = Object.keys(matrix).sort((a, b) => a.localeCompare(b));
                        setCorrelationMatrix(matrix);
                        setGenres(nextGenres);
                        if (nextGenres.length) {
                            setGenreA((current) => current || nextGenres[0]);
                            setGenreB((current) => current || nextGenres[Math.min(1, nextGenres.length - 1)]);
                        }
                    },
                },
            ];

            await Promise.all(
                requests.map(async ({ key, run, onSuccess }) => {
                    try {
                        const data = await run();
                        if (!cancelled) {
                            onSuccess(data);
                            setErrors((current) => ({ ...current, [key]: "" }));
                        }
                    } catch (error) {
                        if (!cancelled) {
                            setErrors((current) => ({
                                ...current,
                                [key]: error?.response?.data?.detail || "Failed to load chart data.",
                            }));
                        }
                    } finally {
                        if (!cancelled) {
                            setLoading((current) => ({ ...current, [key]: false }));
                        }
                    }
                })
            );
        }

        loadDashboard();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!genreA || !genreB) return;

        let cancelled = false;
        setLoading((current) => ({ ...current, pair: true }));
        setErrors((current) => ({ ...current, pair: "" }));

        Promise.all([getConditionalLowRating(genreA, genreB), getConditionalHighRating(genreA, genreB)])
            .then(([low, high]) => {
                if (cancelled) return;
                setConditionalLow(low);
                setConditionalHigh(high);
            })
            .catch((error) => {
                if (cancelled) return;
                setErrors((current) => ({
                    ...current,
                    pair: error?.response?.data?.detail || "Failed to load conditional probability data.",
                }));
                setConditionalLow(null);
                setConditionalHigh(null);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading((current) => ({ ...current, pair: false }));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [genreA, genreB]);

    const topLowGenre = lowGenres[0]?.genre;
    const totalTrackedLowUsers = useMemo(
        () => lowGenres.reduce((sum, item) => sum + item.num_users_with_low_preference, 0),
        [lowGenres]
    );

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, md: 5 },
                py: { xs: 3, md: 4 },
                background:
                    "radial-gradient(circle at top, rgba(232,201,126,0.12), transparent 24%), linear-gradient(180deg, #0f0f12 0%, #0b0b0e 100%)",
            }}
        >
            <Box sx={{ maxWidth: 1440, mx: "auto" }}>
                <Box sx={{ mb: 4 }}>
                    <Chip
                        label="Rating Analysis"
                        size="small"
                        sx={{
                            mb: 1.5,
                            color: "primary.main",
                            background: "rgba(232,201,126,0.08)",
                            border: "1px solid rgba(232,201,126,0.18)",
                        }}
                    />
                    <Typography variant="h3" sx={{ mb: 1 }}>
                        How audiences distribute praise, frustration, and genre crossover
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840 }}>
                        This dashboard turns the viewer rating analysis endpoints into an exploratory view of rating
                        behaviour: overall rater temperament, genres that routinely disappoint, correlation between genre
                        tastes, and conditional genre affinity for selected pairs.
                    </Typography>
                </Box>

                <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} md={4}>
                        <Surface minHeight={128}>
                            <Typography variant="caption" color="text.secondary">
                                Most disliked genre
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 0.75, fontFamily: "Playfair Display, serif" }}>
                                {loading.lowGenres ? "..." : topLowGenre || "N/A"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                Genre with the highest count of users whose ratings skew low more than half the time.
                            </Typography>
                        </Surface>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Surface minHeight={128}>
                            <Typography variant="caption" color="text.secondary">
                                Total low-preference signals
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 0.75, fontFamily: "Playfair Display, serif" }}>
                                {loading.lowGenres ? "..." : totalTrackedLowUsers.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                Aggregate count across all genre-level low-rating user segments returned by the service.
                            </Typography>
                        </Surface>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Surface minHeight={128}>
                            <Typography variant="caption" color="text.secondary">
                                Genres in matrix
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 0.75, fontFamily: "Playfair Display, serif" }}>
                                {loading.correlation ? "..." : genres.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                Each cell compares user-level average ratings between two genres using Pearson
                                correlation.
                            </Typography>
                        </Surface>
                    </Grid>
                </Grid>

                <Grid container spacing={2.5}>
                    <Grid item xs={12} lg={5}>
                        <HarshnessChart data={harshness} loading={loading.harshness} error={errors.harshness} />
                    </Grid>
                    <Grid item xs={12} lg={7}>
                        <LowRatingGenresChart data={lowGenres} loading={loading.lowGenres} error={errors.lowGenres} />
                    </Grid>
                    <Grid item xs={12}>
                        <ViewerRatingCorrelationHeatmap
                            matrix={correlationMatrix}
                            genres={genres}
                            loading={loading.correlation}
                            error={errors.correlation}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <PairExplorer
                            genres={genres}
                            lowData={conditionalLow}
                            highData={conditionalHigh}
                            loading={loading.pair}
                            error={errors.pair}
                            genreA={genreA}
                            genreB={genreB}
                            onGenreAChange={setGenreA}
                            onGenreBChange={setGenreB}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}