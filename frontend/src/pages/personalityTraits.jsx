import { useState, useEffect } from "react";
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
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Grid
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { getTraitGenreCorrelations, getGenreProfiles } from "../services/personalityService";

const TRAITS = ["openness", "agreeableness", "emotional_stability", "conscientiousness", "extraversion"];

const TRAIT_LABELS = {openness: "Openness", agreeableness: "Agreeableness", emotional_stability: "Emotional Stability", conscientiousness: "Conscientiousness", extraversion: "Extraversion",
};

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

function rToTextColor(r) {
    if (!r) return "text.secondary";
    return Math.abs(r) > 0.05 ? "text.primary" : "text.secondary";
}

function SectionHeader({icon, title, subtitle }) {
    return (
        <Box sx={{mb: 3 }}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1.5, mb: 0.5}}>
                {icon}
                <Typography variant="h5" sx={{fontFamily: "Playfair Display, serif", color: "text.primary"}}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ml: 4.5}}>
                {subtitle}
            </Typography>
        </Box>
    );
}

function CorrelationHeatmap({ data, loading, error }) {
    const [activeTrait, setActiveTrait] = useState(null);

    const {genres, lookup} = (() => {
        if (!data || !Array.isArray(data)) return {genres: [], lookup: {}};
        const genreSet = data.map(row => row.genre);
        const lkp = {};
        data.forEach(row => {
            lkp[row.genre] = {};
            Object.entries(row.correlations).forEach(([t, v]) => {
                lkp[row.genre][t] = v.r;
            });
        });
        return {genres: genreSet, lookup: lkp};
    })();

    const visibleTraits = activeTrait ? [activeTrait] : TRAITS;

    return (
        <Box>
            <SectionHeader
                icon={<PsychologyIcon sx={{color: "primary.main", fontSize: 22}} />}
                title="Trait–Genre Correlations"
                subtitle="Pearson r between each personality trait and normalised genre preference. Gold = positive correlation, blue = negative."
            />

            <Box sx={{mb: 2.5}}>
                <Typography variant="caption" color="text.secondary" sx={{display: "block", mb: 1, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem"}}>
                    Filter by trait
                </Typography>
                <ToggleButtonGroup
                    value={activeTrait}
                    exclusive
                    onChange={(_, v) => setActiveTrait(v)}
                    size="small"
                    sx={{
                        flexWrap: "wrap", gap: 0.5,
                        "& .MuiToggleButton-root": {
                            border: "1px solid rgba(232,201,126,0.2)",
                            color: "text.secondary",
                            fontSize: "0.72rem",
                            py: 0.4, px: 1.2,
                            "&.Mui-selected": {
                                background: "rgba(232,201,126,0.15)",
                                color: "primary.main",
                                borderColor: "primary.main",
                            },
                        },
                    }}
                >
                    {TRAITS.map(t => (
                        <ToggleButton key={t} value={t}>{TRAIT_LABELS[t]}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {loading && (
                <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
                    <CircularProgress color="primary" size={32} thickness={2.5} />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && genres.length > 0 && (
                <Box sx={{overflowX: "auto"}}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: `140px repeat(${visibleTraits.length}, 1fr)`,
                            minWidth: visibleTraits.length * 110 + 140,
                            border: "1px solid rgba(232,201,126,0.1)",
                            borderRadius: 1,
                            overflow: "hidden",
                       }}
                    >
                        <Box sx={{background: "rgba(232,201,126,0.06)", p: 1, borderBottom: "1px solid rgba(232,201,126,0.1)"}} />
                        {visibleTraits.map(t => (
                            <Box key={t} sx={{
                                background: "rgba(232,201,126,0.06)",
                                p: 1, textAlign: "center",
                                borderBottom: "1px solid rgba(232,201,126,0.1)",
                                borderLeft: "1px solid rgba(232,201,126,0.08)",
                            }}>
                                <Typography variant="caption" sx={{color: "primary.main", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                                    {TRAIT_LABELS[t]}
                                </Typography>
                            </Box>
                        ))}

                        {genres.map((genre, gi) => (
                            <>
                                <Box key={`label-${genre}`} sx={{
                                    p: 1,
                                    display: "flex", alignItems: "center",
                                    borderBottom: gi < genres.length - 1 ? "1px solid rgba(232,201,126,0.06)" : "none",
                                    background: gi % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                                }}>
                                    <Typography variant="caption" sx={{fontWeight: 600, color: "text.primary", fontSize: "0.78rem" }}>
                                        {genre}
                                    </Typography>
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
                                                <Typography variant="caption" sx={{ color: rToTextColor(r), fontWeight: 600, fontSize: "0.75rem"}}>
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

const DEVIATION_MAX = 0.3;

function DeviationBar({value}) {
    const pct = Math.min(Math.abs(value) / DEVIATION_MAX, 1) * 100;
    const positive = value >= 0;
    return (
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            <Box sx={{flex: 1, display: "flex", justifyContent: "flex-end"}}>
                {!positive && (
                    <Box sx={{
                        height: 6, width: `${pct}%`, borderRadius: "3px 0 0 3px",
                        background: "linear-gradient(90deg, rgba(126,158,232,0.3), rgba(126,158,232,0.8))",
                   }} />
                )}
            </Box>
            <Box sx={{ width: 1, height: 14, background: "rgba(232,201,126,0.25)", flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
                {positive && (
                    <Box sx={{
                        height: 6, width: `${pct}%`, borderRadius: "0 3px 3px 0",
                        background: "linear-gradient(90deg, rgba(232,201,126,0.8), rgba(232,201,126,0.3))",
                    }} />
                )}
            </Box>
        </Box>
    );
}

function GenreProfileCard({profile }) {
    return (
        <Box sx={{
            border: "1px solid rgba(232,201,126,0.1)",
            borderRadius: 1.5,
            p: 2,
            background: "#16161a",
            "&:hover": {borderColor: "rgba(232,201,126,0.3)" },
            transition: "border-color 0.2s",
        }}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", color: "text.primary" }}>
                    {profile.genre}
                </Typography>
                <Chip label={`${profile.user_count.toLocaleString()} users`} size="small"
                    sx={{ fontSize: "0.65rem", height: 20, color: "text.secondary", background: "rgba(255,255,255,0.05)" }} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {TRAITS.map(t => {
                    const {avg, deviation } = profile.traits[t];
                    return (
                        <Box key={t}>
                            <Box sx={{display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                                <Typography variant="caption" sx={{color: "text.secondary", fontSize: "0.7rem" }}>
                                    {TRAIT_LABELS[t]}
                                </Typography>
                                <Box sx={{display: "flex", gap: 1, alignItems: "center" }}>
                                    <Typography variant="caption" sx={{color: "text.secondary", fontSize: "0.68rem" }}>
                                        avg {avg.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" sx={{
                                        fontSize: "0.68rem", fontWeight: 700,
                                        color: deviation >= 0 ? "primary.main" : "secondary.main",
                                    }}>
                                        {deviation >= 0 ? "+" : ""}{deviation.toFixed(3)}
                                    </Typography>
                                </Box>
                            </Box>
                            <DeviationBar value={deviation} />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function GenreProfiles({ data, loading, error }) {
    const [genreFilter, setGenreFilter] = useState("");

    const allGenres = data.map(d => d.genre);
    const visible   = genreFilter ? data.filter(d => d.genre === genreFilter) : data;

    return (
        <Box>
            <SectionHeader
                icon={<PsychologyIcon sx={{ color: "primary.main", fontSize: 22}} />}
                title="Genre Audience Profiles"
                subtitle="Average Big Five personality scores of each genre's audience. Bars show deviation from the overall user population mean."
            />

            <Box sx={{ mb: 3, maxWidth: 260}}>
                <FormControl fullWidth size="small">
                    <InputLabel>Filter by genre</InputLabel>
                    <Select
                        value={genreFilter}
                        label="Filter by genre"
                        onChange={e => setGenreFilter(e.target.value)}
                    >
                        <MenuItem value=""><em>All genres</em></MenuItem>
                        {allGenres.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6}}>
                    <CircularProgress color="primary" size={32} thickness={2.5} />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <Grid container spacing={2}>
                    {visible.map(profile => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={profile.genre}>
                            <GenreProfileCard profile={profile} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default function PersonalityTraits() {
    const [tab, setTab] = useState("correlation");
    const [correlationData, setCorrelationData] = useState([]);
    const [correlationLoading, setCorrelationLoading] = useState(true);
    const [correlationError, setCorrelationError] = useState(null);
    const [profilesData, setProfilesData] = useState([]);
    const [profilesLoading, setProfilesLoading] = useState(false);
    const [profilesError, setProfilesError] = useState(null);
    const [profilesRequested, setProfilesRequested] = useState(false);

    useEffect(() => {
        (async () => {
            setCorrelationLoading(true);
            setCorrelationError(null);
            try {
                const result = await getTraitGenreCorrelations();
                setCorrelationData(result);
            } catch {
                setCorrelationError("Failed to load correlation data.");
            } finally {
                setCorrelationLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (tab !== "profiles" || profilesRequested || profilesLoading) {
            return;
        }

        (async () => {
            setProfilesRequested(true);
            setProfilesLoading(true);
            setProfilesError(null);
            try {
                const result = await getGenreProfiles(null, 100);
                setProfilesData(result);
            } catch {
                setProfilesError("Failed to load genre profiles.");
            } finally {
                setProfilesLoading(false);
            }
        })();
    }, [tab, profilesRequested, profilesLoading]);

    return (
        <Box sx={{p: {xs: 2, md: 4}, maxWidth: 1400, mx: "auto"}}>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{ fontFamily: "Playfair Display, serif", color: "text.primary", mb: 0.5 }}>
                    Personality & Viewing Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Explore how Big Five personality traits relate to genre preferences — supporting targeted marketing and personalised content strategy.
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
                <ToggleButton value="correlation">Trait–Genre Correlations</ToggleButton>
                <ToggleButton value="profiles">Genre Audience Profiles</ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 4 }} />

            {tab === "correlation" && (
                <CorrelationHeatmap
                    data={correlationData}
                    loading={correlationLoading}
                    error={correlationError}
                />
            )}
            {tab === "profiles" && (
                <GenreProfiles
                    data={profilesData}
                    loading={profilesLoading}
                    error={profilesError}
                />
            )}
        </Box>
    );
}
