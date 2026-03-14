import { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Alert,
    Divider,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Switch,
    FormControlLabel,
    Button,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getGenreTrends, getContributorTrends } from "../services/trendAnalysisService";

// ─── Shared palette ────────────────────────────────────────────────────────────
const GOLD = "#e8c97e";
const BLUE = "#7e9ee8";

const LINE_COLORS = [
    "#e8c97e", "#7e9ee8", "#82e8b4", "#e8827e", "#c47ee8",
    "#e8c07e", "#7ec4e8", "#b4e882", "#e882c0", "#82b4e8",
];

// ─── Custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <Box sx={{
            background: "#1e1e24",
            border: "1px solid rgba(232,201,126,0.25)",
            borderRadius: 1.5,
            p: 1.5,
            minWidth: 160,
        }}>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, display: "block", mb: 0.75 }}>
                {label}
            </Typography>
            {payload.map((entry) => (
                <Box key={entry.name} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                        {entry.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: entry.color ?? GOLD, fontWeight: 700, fontSize: "0.72rem" }}>
                        {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

// ─── Section header (matches PersonalityTraits) ─────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                {icon}
                <Typography variant="h5" sx={{ color: "text.primary" }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
                {subtitle}
            </Typography>
        </Box>
    );
}

function GenreTrendChart() {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getGenreTrends();
                setRawData(data);

                // Default: top 5 genres by most recent avg_rating
                const latestDecade = Math.max(...data.map(d => d.decade));
                const topGenres = [...data]
                    .filter(d => d.decade === latestDecade)
                    .sort((a, b) => b.avg_rating - a.avg_rating)
                    .slice(0, 5)
                    .map(d => d.genre);
                setSelectedGenres(topGenres);
            } catch {
                setError("Failed to load genre trend data.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // All unique genres and decades from raw data
    const allGenres = useMemo(() => [...new Set(rawData.map(d => d.genre))].sort(), [rawData]);
    const allDecades = useMemo(() => [...new Set(rawData.map(d => d.decade))].sort((a, b) => a - b), [rawData]);

    // Pivot: [{decade, Genre1: avgRating, Genre2: avgRating, ...}]
    const chartData = useMemo(() => {
        return allDecades.map(decade => {
            const entry = { decade: `${decade}s` };
            selectedGenres.forEach(genre => {
                const row = rawData.find(d => d.decade === decade && d.genre === genre);
                entry[genre] = row ? Number(row.avg_rating).toFixed(2) : null;
            });
            return entry;
        });
    }, [rawData, allDecades, selectedGenres]);

    // Stats for summary cards: most improved genre across all decades
    const summaryStats = useMemo(() => {
        if (!rawData.length || allDecades.length < 2) return null;
        const first = allDecades[0];
        const last = allDecades[allDecades.length - 1];
        let best = null;
        allGenres.forEach(genre => {
            const firstRow = rawData.find(d => d.decade === first && d.genre === genre);
            const lastRow = rawData.find(d => d.decade === last && d.genre === genre);
            if (firstRow && lastRow) {
                const delta = lastRow.avg_rating - firstRow.avg_rating;
                if (!best || delta > best.delta) best = { genre, delta, rating: lastRow.avg_rating };
            }
        });
        return best;
    }, [rawData, allGenres, allDecades]);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="primary" size={32} thickness={2.5} /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <SectionHeader
                icon={<TrendingUpIcon sx={{ color: "primary.main", fontSize: 22 }} />}
                title="Genre Rating Trends by Decade"
                subtitle="Average IMDb rating per genre across decades. Select genres to compare how tastes and quality have shifted over time."
            />

            {/* Summary stat cards */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                {summaryStats && (
                    <Box sx={{
                        border: "1px solid rgba(232,201,126,0.2)",
                        borderRadius: 1.5, px: 2, py: 1,
                        background: "rgba(232,201,126,0.05)",
                        minWidth: 160,
                    }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Most improved genre
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
                            {summaryStats.genre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
                            {summaryStats.delta >= 0 ? "+" : ""}{Number(summaryStats.delta).toFixed(2)} pts over all decades
                        </Typography>
                    </Box>
                )}
                <Box sx={{
                    border: "1px solid rgba(232,201,126,0.2)",
                    borderRadius: 1.5, px: 2, py: 1,
                    background: "rgba(232,201,126,0.05)",
                    minWidth: 160,
                }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Decades tracked
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
                        {allDecades.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
                        {allDecades[0]}s – {allDecades[allDecades.length - 1]}s
                    </Typography>
                </Box>
                <Box sx={{
                    border: "1px solid rgba(232,201,126,0.2)",
                    borderRadius: 1.5, px: 2, py: 1,
                    background: "rgba(232,201,126,0.05)",
                    minWidth: 160,
                }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Genres available
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
                        {allGenres.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
                        {selectedGenres.length} currently selected
                    </Typography>
                </Box>
            </Box>

            {/* Genre multi-select filter */}
            <Box sx={{ mb: 3, maxWidth: 400 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Select Genres</InputLabel>
                    <Select
                        multiple
                        value={selectedGenres}
                        onChange={e => setSelectedGenres(e.target.value)}
                        input={<OutlinedInput label="Select Genres" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map(g => (
                                    <Chip key={g} label={g} size="small" sx={{
                                        height: 20, fontSize: "0.68rem",
                                        background: "rgba(232,201,126,0.1)",
                                        color: "primary.main",
                                        border: "1px solid rgba(232,201,126,0.25)",
                                    }} />
                                ))}
                            </Box>
                        )}
                    >
                        {allGenres.map(g => (
                            <MenuItem key={g} value={g}>
                                <Checkbox checked={selectedGenres.includes(g)} size="small" sx={{ color: "primary.main", p: 0.5 }} />
                                <ListItemText primary={g} primaryTypographyProps={{ fontSize: "0.85rem" }} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedGenres.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    Select at least one genre to display the chart.
                </Typography>
            ) : (
                <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(232,201,126,0.06)" />
                        <XAxis
                            dataKey="decade"
                            tick={{ fill: "#9a9082", fontSize: 11 }}
                            axisLine={{ stroke: "rgba(232,201,126,0.15)" }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 10]}
                            tick={{ fill: "#9a9082", fontSize: 11 }}
                            axisLine={{ stroke: "rgba(232,201,126,0.15)" }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(232,201,126,0.15)" }} />
                        <Legend wrapperStyle={{ fontSize: "0.75rem", color: "#9a9082", paddingTop: 8 }} />
                        {selectedGenres.map((genre, i) => (
                            <Line
                                key={genre}
                                type="monotone"
                                dataKey={genre}
                                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                                activeDot={{ r: 5 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Box>
    );
}

// ─── Contributor Trend Chart ────────────────────────────────────────────────────
function ContributorTrendChart({ allGenres }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [lastDecade, setLastDecade] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getContributorTrends({ genres: selectedGenres, last_decade: lastDecade });
            setData(result);
            setHasFetched(true);
        } catch {
            setError("Failed to load contributor data.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount with default filters
    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const maxVotes = Math.max(...data.map(d => d.total_votes || 0), 1);

    return (
        <Box>
            <SectionHeader
                icon={<PeopleIcon sx={{ color: "primary.main", fontSize: 22 }} />}
                title="Top Contributors by Vote Impact"
                subtitle="The 5 contributors whose films have attracted the most votes. Filter by genre or restrict to the most recent decade."
            />

            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Filter by Genre</InputLabel>
                    <Select
                        multiple
                        value={selectedGenres}
                        onChange={e => setSelectedGenres(e.target.value)}
                        input={<OutlinedInput label="Filter by Genre" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map(g => (
                                    <Chip key={g} label={g} size="small" sx={{
                                        height: 20, fontSize: "0.68rem",
                                        background: "rgba(232,201,126,0.1)",
                                        color: "primary.main",
                                        border: "1px solid rgba(232,201,126,0.25)",
                                    }} />
                                ))}
                            </Box>
                        )}
                    >
                        {allGenres.map(g => (
                            <MenuItem key={g} value={g}>
                                <Checkbox checked={selectedGenres.includes(g)} size="small" sx={{ color: "primary.main", p: 0.5 }} />
                                <ListItemText primary={g} primaryTypographyProps={{ fontSize: "0.85rem" }} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            checked={lastDecade}
                            onChange={e => setLastDecade(e.target.checked)}
                            size="small"
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: GOLD },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: GOLD },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                            Last decade only
                        </Typography>
                    }
                />

                <Button
                    variant="outlined"
                    size="small"
                    onClick={fetchData}
                    disabled={loading}
                    sx={{
                        borderColor: "rgba(232,201,126,0.4)",
                        color: "primary.main",
                        fontSize: "0.78rem",
                        "&:hover": { borderColor: GOLD, background: "rgba(232,201,126,0.06)" },
                    }}
                >
                    Apply
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress color="primary" size={32} thickness={2.5} />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && hasFetched && data.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    No contributors found for the selected filters.
                </Typography>
            )}

            {!loading && !error && data.length > 0 && (
                <>
                    {/* Top contributor summary card */}
                    <Box sx={{
                        border: "1px solid rgba(232,201,126,0.2)",
                        borderRadius: 1.5, px: 2, py: 1,
                        background: "rgba(232,201,126,0.05)",
                        display: "inline-flex", gap: 3, mb: 3, flexWrap: "wrap",
                    }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                #1 contributor
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
                                {data[0].name}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Total Votes
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                                {Number(data[0].total_votes).toLocaleString()}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Movies
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                                {data[0].movies_cnt}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Bar chart — Total Votes */}
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mb: 1 }}>
                        Total votes across all films
                    </Typography>
                    <ResponsiveContainer width="100%" height={data.length * 52 + 40}>
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 80, left: 130, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} stroke="rgba(232,201,126,0.06)" />
                            <XAxis
                                type="number"
                                tick={{ fill: "#9a9082", fontSize: 11 }}
                                axisLine={{ stroke: "rgba(232,201,126,0.15)" }}
                                tickLine={false}
                                tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={125}
                                tick={{ fill: "#f0ece3", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "rgba(232,201,126,0.04)" }}
                                formatter={(value) => [Number(value).toLocaleString(), "Total Votes"]}
                            />
                            <Bar
                                dataKey="total_votes"
                                name="Total Votes"
                                maxBarSize={20}
                                shape={(props) => {
                                    const { x, y, width, height, index } = props;
                                    const fill = index === 0 ? GOLD : `rgba(232,201,126,${0.3 + (1 - index / data.length) * 0.4})`;
                                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />;
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Bar chart — Movies Count */}
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mt: 4, mb: 1 }}>
                        Number of films
                    </Typography>
                    <ResponsiveContainer width="100%" height={data.length * 52 + 40}>
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 80, left: 130, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} stroke="rgba(126,158,232,0.06)" />
                            <XAxis
                                type="number"
                                tick={{ fill: "#9a9082", fontSize: 11 }}
                                axisLine={{ stroke: "rgba(126,158,232,0.15)" }}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={125}
                                tick={{ fill: "#f0ece3", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: "rgba(126,158,232,0.04)" }}
                                formatter={(value) => [value, "Films"]}
                            />
                            <Bar
                                dataKey="movies_cnt"
                                name="Films"
                                maxBarSize={20}
                                shape={(props) => {
                                    const { x, y, width, height, index } = props;
                                    const fill = index === 0 ? BLUE : `rgba(126,158,232,${0.3 + (1 - index / data.length) * 0.4})`;
                                    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />;
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </>
            )}
        </Box>
    );
}

// ─── Page root ──────────────────────────────────────────────────────────────────
export default function TrendAnalysis() {
    const [tab, setTab] = useState("genre");

    // Genre list fetched once and shared with ContributorTrendChart filter
    const [allGenres, setAllGenres] = useState([]);
    useEffect(() => {
        getGenreTrends()
            .then(data => setAllGenres([...new Set(data.map(d => d.genre))].sort()))
            .catch(() => {});
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: "text.primary", mb: 0.5 }}>
                    Trend Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Explore how genre ratings have evolved across decades and which contributors have had the greatest audience reach.
                </Typography>
            </Box>

            <ToggleButtonGroup
                value={tab}
                exclusive
                onChange={(_, v) => v && setTab(v)}
                size="small"
                sx={{
                    mb: 4,
                    "& .MuiToggleButton-root": {
                        border: "1px solid rgba(232,201,126,0.2)",
                        color: "text.secondary", px: 2.5, py: 0.75, fontSize: "0.82rem",
                        "&.Mui-selected": { background: "rgba(232,201,126,0.12)", color: "primary.main", borderColor: "primary.main" },
                    },
                }}
            >
                <ToggleButton value="genre">Genre Trends</ToggleButton>
                <ToggleButton value="contributor">Contributor Trends</ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 4 }} />

            {tab === "genre" && <GenreTrendChart />}
            {tab === "contributor" && <ContributorTrendChart allGenres={allGenres} />}
        </Box>
    );
}