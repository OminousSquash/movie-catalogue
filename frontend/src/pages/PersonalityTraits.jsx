import { useState, useEffect, useCallback } from "react";
import {
    Box, 
    Typography, 
    ToggleButton, 
    ToggleButtonGroup,
    CircularProgress, 
    Alert, 
    Chip, 
    Tooltip, 
    Divider,
    Grid,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getTraitGenreCorrelations, getGenreProfiles } from "../services/personalityService";

const TRAITS = ["openness", "agreeableness", "emotional_stability", "conscientiousness", "extraversion"];

const TRAIT_LABELS = {openness: "Openness", agreeableness: "Agreeableness", emotional_stability: "Emotional Stability", conscientiousness: "Conscientiousness", extraversion: "Extraversion",
};

const TRAIT_SHORT = {openness: "Open.", agreeableness: "Agree.", emotional_stability: "E. Stability", extraversion: "Extra."};

function RadarChart({profile, size = 160, expanded = false}) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;
    const labelR = size * 0.48;
    const n = TRAITS.length;

    const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

    const toXY = (i, value, maxVal = 10) => {
        const a = angle(i);
        const len = (value / maxVal) * r;
        return {x: cx + len * Math.cos(a), y: cy + len * Math.sin(a)};
    };

    const labelXY = (i) => {
        const a = angle(i);
        return {x: cx + labelR * Math.cos(a), y: cy + labelR * Math.sin(a)};
    };

    const POPULATION_MEANS = {
        openness: 5.37, agreeableness: 4.22,
        emotional_stability: 4.56, conscientiousness: 4.66, extraversion: 3.48,
    };

    const dataPoints = TRAITS.map((t, i) => toXY(i, profile.traits[t].avg));
    const meanPoints = TRAITS.map((t, i) => toXY(i, POPULATION_MEANS[t]));
    const gridLevels = [2, 4, 6, 8, 10];

    const pointsStr = (pts) => pts.map(p => `${p.x},${p.y}`).join(" ");

    const fontSize = expanded ? 11 : 8;
    const valueSize = expanded ? 10 : 7;
    const strokeWidth = expanded ? 1.5 : 1;

    return (
        <svg width={size} height={size} style={{ overflow: "visible" }}>
            {/* Grid circles */}
            {gridLevels.map(lvl => {
                const pts = TRAITS.map((_, i) => toXY(i, lvl));
                return (
                    <polygon key={lvl} points={pointsStr(pts)} fill="none" stroke="rgba(232,201,126,0.08)" strokeWidth={0.5}/>
                );
            })}

            {TRAITS.map((_, i) => {
                const end = toXY(i, 10);
                return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
                    stroke="rgba(232,201,126,0.1)" strokeWidth={0.5} />;
            })}

            <polygon points={pointsStr(meanPoints)} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} strokeDasharray="3,3"/>

            <polygon points={pointsStr(dataPoints)} fill="rgba(232,201,126,0.18)" stroke="#e8c97e" strokeWidth={strokeWidth + 0.5}/>

            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={expanded ? 3 : 2}
                    fill="#e8c97e" />
            ))}

            {TRAITS.map((t, i) => {
                const { x, y } = labelXY(i);
                const label = expanded ? TRAIT_LABELS[t] : TRAIT_SHORT[t];
                const avg = profile.traits[t].avg;
                const dev = profile.traits[t].deviation;
                const devColor = dev > 0.05 ? "#e8c97e" : dev < -0.05 ? "#7e9ee8" : "#9a9082";
                return (
                    <g key={t}>
                        <text x={x} y={y - (expanded ? 5 : 3)}
                            textAnchor="middle"
                            fill="#9a9082"
                            fontSize={fontSize}
                            fontFamily="DM Sans, sans-serif"
                        >
                            {label}
                        </text>
                        {expanded && (
                            <text x={x} y={y + 9}
                                textAnchor="middle"
                                fill={devColor}
                                fontSize={valueSize}
                                fontFamily="DM Sans, sans-serif"
                                fontWeight="700"
                            >
                                {avg.toFixed(2)} ({dev >= 0 ? "+" : ""}{dev.toFixed(2)})
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

function GenreCard({ profile, onClick }) {
    const topTrait = TRAITS.reduce((best, t) =>
        Math.abs(profile.traits[t].deviation) > Math.abs(profile.traits[best].deviation) ? t : best
    , TRAITS[0]);
    const topDev = profile.traits[topTrait].deviation;

    return (
        <Box onClick={onClick} sx={{
            border: "1px solid rgba(232,201,126,0.1)",
            borderRadius: 2,
            p: 2,
            background: "#16161a",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            "&:hover": {
                borderColor: "rgba(232,201,126,0.4)",
                background: "rgba(232,201,126,0.03)",
                transform: "translateY(-2px)",
            },
            transition: "all 0.2s",
        }}>
            <Typography variant="subtitle2" sx={{
                fontFamily: "Playfair Display, serif",
                color: "text.primary",
                fontSize: "0.85rem",
                textAlign: "center",
            }}>
                {profile.genre}
            </Typography>

            <RadarChart profile={profile} size={130} />

            <Tooltip title={`Most distinctive trait: ${TRAIT_LABELS[topTrait]} (${topDev >= 0 ? "+" : ""}${topDev.toFixed(3)} vs population)`}>
                <Chip
                    label={`${TRAIT_SHORT[topTrait]} ${topDev >= 0 ? "▲" : "▼"}`}
                    size="small"
                    sx={{ fontSize: "0.65rem", height: 20, fontWeight: 700, background: topDev >= 0 ? "rgba(232,201,126,0.15)" : "rgba(126,158,232,0.15)", color: topDev >= 0 ? "primary.main" : "secondary.main", border: `1px solid ${topDev >= 0 ? "rgba(232,201,126,0.3)" : "rgba(126,158,232,0.3)"}`}}
                />
            </Tooltip>

            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
                {profile.user_count.toLocaleString()} users
            </Typography>
        </Box>
    );
}

function GenreModal({ profile, open, onClose }) {
    if (!profile) return null;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { background: "#16161a", border: "1px solid rgba(232,201,126,0.2)", borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Typography variant="h6" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary" }}>
                    {profile.genre}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {profile.user_count.toLocaleString()} users
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <RadarChart profile={profile} size={280} expanded />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{
                    display: "block", textAlign: "center", mb: 2,
                    fontSize: "0.7rem", letterSpacing: "0.05em"
                }}>
                    Gold polygon = genre audience | Dashed = population average | Values show avg. score (deviation).
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {TRAITS.map(t => {
                        const { avg, deviation } = profile.traits[t];
                        const pct = (avg / 10) * 100;
                        const devColor = deviation > 0.05 ? "#e8c97e"
                            : deviation < -0.05 ? "#7e9ee8" : "#9a9082";
                        return (
                            <Box key={t}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                        {TRAIT_LABELS[t]}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1.5 }}>
                                        <Typography variant="caption" sx={{ color: "text.primary", fontSize: "0.75rem" }}>
                                            {avg.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: devColor, fontWeight: 700, fontSize: "0.75rem" }}>
                                            {deviation >= 0 ? "+" : ""}{deviation.toFixed(3)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ height: 5, borderRadius: 1, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                    <Box sx={{height: "100%", width: `${pct}%`, borderRadius: 1, background: "linear-gradient(90deg, rgba(232,201,126,0.6), rgba(232,201,126,1))",}} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

function GenreProfiles() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [sortBy, setSortBy] = useState("genre");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getGenreProfiles(null, 100);
                setData(result);
            } catch {
                setError("Failed to load genre profiles.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const sorted = [...data].sort((a, b) => {
        if (sortBy === "genre") return a.genre.localeCompare(b.genre);
        if (sortBy === "users") return b.user_count - a.user_count;
        return Math.abs(b.traits[sortBy]?.deviation || 0) - Math.abs(a.traits[sortBy]?.deviation || 0);
    });

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Genre Audience Profiles.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Each radar shows the Big Five personality profile of that genre's audience. Gold = above population average, dashed = population mean. Click any card to expand.
                </Typography>
            </Box>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                    Sort by
                </Typography>
                <ToggleButtonGroup value={sortBy} exclusive onChange={(_, v) => v && setSortBy(v)} size="small"
                    sx={{flexWrap: "wrap", gap: 0.5, "& .MuiToggleButton-root": { border: "1px solid rgba(232,201,126,0.2)", color: "text.secondary", fontSize: "0.7rem", py: 0.3, px: 1, "&.Mui-selected": { background: "rgba(232,201,126,0.12)", color: "primary.main", borderColor: "primary.main" }}}}>
                    <ToggleButton value="genre">A To Z</ToggleButton>
                    <ToggleButton value="users">Most Users</ToggleButton>
                    {TRAITS.map(t => (
                        <ToggleButton key={t} value={t}>{TRAIT_SHORT[t]}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress color="primary" size={32} thickness={2.5} />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <Grid container spacing={2}>
                    {sorted.map(profile => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={profile.genre}>
                            <GenreCard profile={profile} onClick={() => setSelected(profile)} />
                        </Grid>
                    ))}
                </Grid>
            )}

            <GenreModal
                profile={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </Box>
    );
}


function rToColor(r) {
    if (r === null || r === undefined) return "rgba(255,255,255,0.04)";
    const clamped = Math.max(-0.15, Math.min(0.15, r));
    if (clamped >= 0) {
        const t = clamped / 0.15;
        return `rgba(232, 201, 126, ${0.1 + t * 0.55})`;
    } else {
        const t = Math.abs(clamped) / 0.15;
        return `rgba(126, 158, 232, ${0.1 + t * 0.55})`;
    }
}

function CorrelationHeatmap(){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTrait, setActiveTrait] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await getTraitGenreCorrelations(activeTrait));
        } catch {
            setError("Failed to load correlation dataa");
        } finally {
            setLoading(false);
        }
    }, [activeTrait]);

    useEffect(() => {load();}, [load]);

    const { genres, lookup } = (() => {
        if (!data || !Array.isArray(data)) return { genres: [], lookup: {} };
        const lkp = {};
        data.forEach(row => {
            lkp[row.genre] = {};
            Object.entries(row.correlations).forEach(([t, v]) => { lkp[row.genre][t] = v.r;});
        });
        return {genres: data.map(r => r.genre), lookup: lkp};
    })();

    const visibleTraits = activeTrait ? [activeTrait] : TRAITS;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Trait - Genre Correlations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Pearson 'r' between each personality trait and normalised genre preference. Gold = trait drives preference, blue = trait suppresses it.
                </Typography>
            </Box>

            <Box sx={{mb: 2.5}}>
                <Typography variant="caption" color="text.secondary" sx={{display: "block", mb: 1, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem"}}>
                    Filter by trait
                </Typography>
                <ToggleButtonGroup value={activeTrait} exclusive onChange={(_, v) => setActiveTrait(v)} size="small"
                    sx={{
                        flexWrap: "wrap", gap: 0.5,
                        "& .MuiToggleButton-root": {
                            border: "1px solid rgba(232,201,126,0.2)",
                            color: "text.secondary", fontSize: "0.72rem", py: 0.4, px: 1.2,
                            "&.Mui-selected": { background: "rgba(232,201,126,0.15)", color: "primary.main", borderColor: "primary.main",
                            },
                        },
                    }}
                >
                    {TRAITS.map(t =>  <ToggleButton key={t} value={t}>{TRAIT_LABELS[t]}</ToggleButton>)}
                </ToggleButtonGroup>
            </Box>

            {loading && <Box sx={{display: "flex", justifyContent: "center", py: 6}}> <CircularProgress color="primary" size={32} thickness={2.5} /></Box>}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && genres.length > 0 && (
                <Box sx={{overflowX: "auto"}}>
                    <Box sx={{
                            display: "grid",
                            gridTemplateColumns: `140px repeat(${visibleTraits.length}, 1fr)`,
                            minWidth: visibleTraits.length * 110 + 140,
                            border: "1px solid rgba(232,201,126,0.1)",
                            borderRadius: 1, overflow: "hidden",
                       }}>
                        <Box sx={{background: "rgba(232,201,126,0.06)", p: 1, borderBottom: "1px solid rgba(232,201,126,0.1)"}} />
                        {visibleTraits.map(t => (
                            <Box key={t} sx={{ background: "rgba(232,201,126,0.06)", p: 1, textAlign: "center", borderBottom: "1px solid rgba(232,201,126,0.1)", borderLeft: "1px solid rgba(232,201,126,0.08)"}}>
                                <Typography variant="caption" sx={{color: "primary.main", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                                    {TRAIT_LABELS[t]}
                                </Typography>
                            </Box>
                        ))}

                        {genres.map((genre, gi) => (
                            <>
                                <Box key={`label-${genre}`} sx={{ p: 1, display: "flex", alignItems: "center", borderBottom: gi < genres.length - 1 ? "1px solid rgba(232,201,126,0.06)" : "none", background: gi % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}}>
                                    <Typography variant="caption" sx={{fontWeight: 600, color: "text.primary", fontSize: "0.78rem" }}>{genre}</Typography>
                                </Box>
                                {visibleTraits.map(t => {
                                    const r = lookup[genre]?.[t];
                                    return (
                                        <Tooltip key={`${genre}-${t}`} title={`${TRAIT_LABELS[t]} × ${genre}: r = ${r ?? "N/A"}`} arrow>
                                            <Box sx={{
                                                p: 1, textAlign: "center",
                                                background: rToColor(r),
                                                borderLeft: "1px solid rgba(232,201,126,0.06)",
                                                borderBottom: gi < genres.length - 1 ? "1px solid rgba(232,201,126,0.06)" : "none",
                                                cursor: "default",
                                                transition: "filter 0.15s",
                                                "&:hover": {filter: "brightness(1.3)"},
                                            }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.75rem", color: Math.abs(r || 0) > 0.05 ? "text.primary" : "text.secondary" }}>
                                                    {r !== null && r !== undefined ? r.toFixed(3) : "—"}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, flexWrap: "wrap"}}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75}}>
                            <Box sx={{ width: 14, height: 14, borderRadius: 0.5, background: "rgba(126,158,232,0.65)"}} />
                            <Typography variant="caption" color="text.secondary">Negative (trait suppresses preference)</Typography>
                        </Box>
                        <Box sx={{display: "flex", alignItems: "center", gap: 0.75}}>
                            <Box sx={{width: 14, height: 14, borderRadius: 0.5, background: "rgba(232,201,126,0.65)"}} />
                            <Typography variant="caption" color="text.secondary">Positive (trait drives preference)</Typography>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default function PersonalityTraits() {
    const [tab, setTab] = useState("profiles");

    return (
        <Box sx={{p: {xs: 2, md: 4}, maxWidth: 1400, mx: "auto"}}>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Personality & Viewing Preferences.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Explore how Five personality traits relate to genre preferences:
                </Typography>
            </Box>

            <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} size="small"
                sx={{
                    mb: 4,
                    "& .MuiToggleButton-root": {
                        border: "1px solid rgba(232,201,126,0.2)",
                        color: "text.secondary",
                        px: 2.5, py: 0.75,
                        fontSize: "0.82rem",
                        "&.Mui-selected": {
                            background: "rgba(232,201,126,0.12)",
                            color: "primary.main",
                            borderColor: "primary.main",
                        },
                    },
                }}
            >
                <ToggleButton value="correlation">Trait - Genre Correlations</ToggleButton>
                <ToggleButton value="profiles">Genre Audience Profiles</ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 4 }} />

            {tab === "profiles"     && <GenreProfiles />}
            {tab === "correlation"  && <CorrelationHeatmap />}
        </Box>
    );
}