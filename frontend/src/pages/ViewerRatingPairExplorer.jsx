import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SectionHeader from "../components/SectionHeader";
import Surface from "../components/Surface";
import {
    getConditionalHighRating,
    getConditionalLowRating,
    getGenreCorrelationMatrix,
} from "../services/viewerRatingService";

function ProbabilityMeter({ label, probability, color, sampleSize }) {
    const pct = Math.max(0, Math.min((probability ?? 0) * 100, 100));

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {pct.toFixed(1)}% · n={(sampleSize ?? 0).toLocaleString()}
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

export default function ViewerRatingPairExplorer() {
    const [genres, setGenres] = useState([]);
    const [genreA, setGenreA] = useState("");
    const [genreB, setGenreB] = useState("");
    const [lowData, setLowData] = useState(null);
    const [highData, setHighData] = useState(null);
    const [loadingGenres, setLoadingGenres] = useState(true);
    const [loadingPair, setLoadingPair] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadGenres() {
            try {
                const result = await getGenreCorrelationMatrix();
                const matrix = result && typeof result === "object" ? result : {};
                const nextGenres = Object.keys(matrix).sort((a, b) => a.localeCompare(b));

                if (!cancelled) {
                    setGenres(nextGenres);
                    setGenreA(nextGenres[0] || "");
                    setGenreB(nextGenres[Math.min(1, nextGenres.length - 1)] || nextGenres[0] || "");
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setGenres([]);
                    setError(err?.response?.data?.detail || "Failed to load available genres.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingGenres(false);
                }
            }
        }

        loadGenres();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!genreA || !genreB) return;

        let cancelled = false;
        setLoadingPair(true);
        setError("");

        Promise.all([getConditionalLowRating(genreA, genreB), getConditionalHighRating(genreA, genreB)])
            .then(([lowResult, highResult]) => {
                if (cancelled) return;
                setLowData(lowResult);
                setHighData(highResult);
            })
            .catch((err) => {
                if (cancelled) return;
                setLowData(null);
                setHighData(null);
                setError(err?.response?.data?.detail || "Failed to load conditional probability data.");
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingPair(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [genreA, genreB]);

    const isLoading = loadingGenres || loadingPair;

    return (
        <Surface minHeight={380}>
            <SectionHeader
                icon={<CompareArrowsOutlinedIcon sx={{ color: "primary.main" }} />}
                title="Genre Pair Explorer"
                subtitle="Compare whether users who love or dislike one genre are likely to behave the same way in another."
                chip={genreA && genreB ? `${genreA} -> ${genreB}` : null}
            />

            {loadingGenres ? <LoadingState height={180} /> : null}
            {!loadingGenres && error ? <Alert severity="error">{error}</Alert> : null}
            {!loadingGenres && !error && !genres.length ? (
                <EmptyState message="No genres are available for pair exploration." height={180} />
            ) : null}

            {!loadingGenres && genres.length ? (
                <>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Base genre</InputLabel>
                                <Select value={genreA} label="Base genre" onChange={(event) => setGenreA(event.target.value)}>
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
                                <Select value={genreB} label="Compared genre" onChange={(event) => setGenreB(event.target.value)}>
                                    {genres.map((genre) => (
                                        <MenuItem key={genre} value={genre}>
                                            {genre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {loadingPair ? <LoadingState height={180} /> : null}
                    {!isLoading && !error && (!lowData || !highData) ? (
                        <EmptyState message="Select two genres to load conditional probabilities." height={180} />
                    ) : null}

                    {!isLoading && !error && lowData && highData ? (
                        <Stack spacing={2.25}>
                            <ProbabilityMeter
                                label={`P(low in ${lowData.genre_b} | low in ${lowData.genre_a})`}
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
                                            {((lowData.probability ?? 0) * 100).toFixed(1)}%
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
                                            {((highData.probability ?? 0) * 100).toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                            Users who strongly like {genreA} and also strongly like {genreB}.
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Stack>
                    ) : null}
                </>
            ) : null}
        </Surface>
    );
}
