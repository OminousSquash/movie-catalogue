import { useState, useEffect } from "react";
import {
    Box, 
    Typography, 
    ToggleButton, 
    ToggleButtonGroup, 
    CircularProgress,
    Alert,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Menu
} from "@mui/material";
import {
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid,
    Tooltip, 
    ResponsiveContainer, 
    Cell, 
    Legend
} from "recharts";
import { getGenrePopularity, getGenrePolarisation } from "../services/genreReportService";

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
                    <Typography variant="caption" sx={{ color: entry.color, fontWeight: 700, fontSize: "0.72rem" }}>
                        {typeof entry.value === "number" ? entry.value.toFixed(3) : entry.value}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

function GenreJumper({genres, selected, onChange}){
    return (
        <FormControl size="small" sx="{{ minwidth: 200 }}">
            <InputLabel>Jump To Genre</InputLabel>
            <Select value={selected} label="Jump To Genre" onChange={e => onChange(e.target.value)}>
                <MenuItem value=""><em>All Genres</em></MenuItem>
                {genres.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
        </FormControl>
    );
}
function PopularityChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]= useState(null);
    const [highlighted, setHighlighted] = useState("");
    const rowRefs = useRef({});

    useEffect(() => {
        (async () => {
            try {
                const raw = await getGenrePopularity();
                const sorted = [...raw].filter(d => d.genre && d.genre.trim() !== "N").sort((a, b) => b.avg_rating - a.avg_rating);
                setData(sorted);
            } catch {
                setError("Failed to load popularity daat");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const maxVotes = Math.max(...data.map(d => d.avg_num_votes || 0), 1);
    const genres = data.map(d => d.genre);

    const handleJump = (genre) => {
        setHighlighted(genre);
        if (genre && rowRefs.current[genre]){
            rowRefs.current[genre].scrollIntoView({behavior: "smooth", block: "center"});
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="primary" size={32} thickness={2.5} /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Genre Popularity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Average rating per genre from our dataset which is sorted from highest to lowest. Bar brightness reflects average vote count = brighter means more votes backing the score.
                </Typography>
            </Box>

            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {data.slice(0, 3).map((d, i) => (
                        <Box key={d.genre} sx={{
                            border: "1px solid rgba(232,201,126,0.2)",
                            borderRadius: 1.5, px: 2, py: 1,
                            background: "rgba(232,201,126,0.05)",
                            minWidth: 120,
                        }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                #{i + 1} by rating
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "primary.main", fontFamily: "Playfair Display, serif" }}>
                                {d.genre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
                                {Number(d.avg_rating).toFixed(2)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <GenreJumper genres={genres} selected={highlighted} onChange={handleJump} />
            
            </Box>

            <ResponsiveContainer width="100%" height={data.length * 32 + 40}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 60, left: 80, bottom: 0 }}
                >
                    <CartesianGrid horizontal={false} stroke="rgba(232,201,126,0.06)" />
                    <XAxis
                        type="number"
                        domain={[0, 10]}
                        tick={{ fill: "#9a9082", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(232,201,126,0.15)" }}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="genre"
                        width={75}
                        tick={(props) => {
                            const {x, y, payload} = props;
                            const isHighlighted = payload.value === highlighted;
                            return (
                                <g ref={e => {if (e) rowRefs.current[payload.value] = e;}}>
                                    <text x={x} y={y} dy={4} textAnchor="end" fill={isHighlighted ? "#e8c97e" : "#f0ece3"} fontWeight={isHighlighted ? 700 : 400} fontSize={12}>
                                        {payload.value}
                                    </text>
                                </g>
                            );
                        }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232,201,126,0.04)" }} />
                    <Bar dataKey="avg_rating" name="Avg Rating" radius={[0, 3, 3, 0]} maxBarSize={20}>
                        {data.map((entry) => {
                            const isHighlighted = entry.genre === highlighted;
                            const opacity = 0.35 + 0.75 * (entry.avg_num_votes / maxVotes);
                            const fill = isHighlighted 
                                ? "#f5e199" 
                                : highlighted 
                                    ? `rgba(232,201,126,${(opacity * 0.35).toFixed(2)})` : `rgba(232,201,126),${opacity.toFixed(2)})`;
                            return <Cell key={entry.genre} fill={fill} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
                <Box sx={{ width: 60, height: 8, borderRadius: 1, background: "linear-gradient(90deg, rgba(232,201,126,0.35), rgba(232,201,126,1))" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                    Brighter bar = higher avg vote count (more reliable score)
                </Typography>
            </Box>
        </Box>
    );
}

function PolarisationChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const raw = await getGenrePolarisation();
                const sorted = [...raw].filter(d => d.genre && d.genre.trim() !== "N").sort((a, b) => b.polarisation_score - a.polarisation_score);
                setData(sorted);
            } catch {
                setError("Failed to load polarisation data");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="primary" size={32} thickness={2.5} /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Genre Polarisation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Genres sorted by polarisation score (composite of STD DEV and % extreme ratings). IQR shows the spread between the 25th and 75th percentile, so a wider means more diverse middle grounds
                </Typography>
            </Box>

            {data[0] && (
                <Box sx={{
                    border: "1px solid rgba(232,201,126,0.2)",
                    borderRadius: 1.5, px: 2, py: 1,
                    background: "rgba(232,201,126,0.05)",
                    display: "inline-flex", gap: 3, mb: 3, flexWrap: "wrap",
                }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Most polarising genre
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "primary.main", fontFamily: "Playfair Display, serif" }}>
                            {data[0].genre}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Score
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                            {Number(data[0].polarisation_score).toFixed(3)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            High ratings %
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                            {Number(data[0].high_percent).toFixed(1)}%
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Low ratings %
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
                            {Number(data[0].low_percent).toFixed(1)}%
                        </Typography>
                    </Box>
                </Box>
            )}

            <ResponsiveContainer width="100%" height={data.length * 36 + 40}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 60, left: 80, bottom: 0 }}
                >
                    <CartesianGrid horizontal={false} stroke="rgba(232,201,126,0.06)" />
                    <XAxis
                        type="number"
                        tick={{ fill: "#9a9082", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(232,201,126,0.15)" }}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="genre"
                        width={75}
                        tick={{ fill: "#f0ece3", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(232,201,126,0.04)" }} />
                    <Legend
                        wrapperStyle={{ fontSize: "0.75rem", color: "#9a9082", paddingTop: 8 }}
                    />
                    <Bar dataKey="polarisation_score" name="Polarisation Score" fill="rgba(232,201,126,0.75)" radius={[0, 3, 3, 0]} maxBarSize={14} />
                    <Bar dataKey="iqr" name="IQR (rating spread)" fill="rgba(126,158,232,0.6)" radius={[0, 3, 3, 0]} maxBarSize={14} />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}

export default function GenreReports() {
    const [tab, setTab] = useState("popularity");

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Genre Popularity & Polarisation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Shows which genres are consistently doing well
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
                <ToggleButton value="popularity">Popularity</ToggleButton>
                <ToggleButton value="polarisation">Polarisation</ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 4 }} />

            {tab === "popularity"   && <PopularityChart />}
            {tab === "polarisation" && <PolarisationChart />}
        </Box>
    );
}