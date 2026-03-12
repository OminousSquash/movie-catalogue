import { useEffect, useState } from "react";
import { Alert, Box, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import SectionHeader from "./SectionHeader";
import Surface from "./Surface";

function correlationColor(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "rgba(255,255,255,0.04)";
    }

    if (value >= 0) {
        const alpha = 0.1 + Math.min(value, 1) * 0.65;
        return `rgba(232,201,126,${alpha})`;
    }

    const alpha = 0.1 + Math.min(Math.abs(value), 1) * 0.65;
    return `rgba(126,158,232,${alpha})`;
}

export default function ViewerRatingCorrelationHeatmap({ matrix, loading, error, genres }) {
    const [selectedRow, setSelectedRow] = useState("");
    const [selectedCol, setSelectedCol] = useState("");

    useEffect(() => {
        setSelectedRow((current) => (current && genres.includes(current) ? current : ""));
        setSelectedCol((current) => (current && genres.includes(current) ? current : ""));
    }, [genres]);

    const getHeaderStyles = (genre, isRowLabel = false) => {
        const isSelected = isRowLabel ? genre === selectedRow : genre === selectedCol;

        return {
            background: isSelected ? "rgba(232,201,126,0.16)" : "rgba(232,201,126,0.06)",
            boxShadow: isSelected ? "inset 0 0 0 1px rgba(232,201,126,0.25)" : "none",
            ...(isRowLabel
                ? {}
                : {
                      borderLeft: "1px solid rgba(232,201,126,0.06)",
                      textAlign: "center",
                  }),
        };
    };

    const getCellHighlightStyles = (rowGenre, colGenre) => {
        const isIntersection = rowGenre === selectedRow && colGenre === selectedCol && selectedRow && selectedCol;
        const isRowMatch = rowGenre === selectedRow;
        const isColMatch = colGenre === selectedCol;

        if (isIntersection) {
            return {
                boxShadow: "inset 0 0 0 2px rgba(232,201,126,0.95)",
                filter: "brightness(1.2)",
            };
        }

        if (isRowMatch || isColMatch) {
            return {
                boxShadow: "inset 0 0 0 1px rgba(232,201,126,0.4)",
                filter: "brightness(1.08)",
            };
        }

        return {};
    };

    return (
        <Surface minHeight={460}>
            <SectionHeader
                icon={<HubOutlinedIcon sx={{ color: "primary.main" }} />}
                title="Genre Correlation Matrix"
                subtitle="Pearson correlation between users' average ratings across genres. The brighter the gold, the better the overlap in taste"
                chip={genres.length ? `${genres.length} x ${genres.length}` : null}
            />

            {loading ? <LoadingState height={320} /> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {!loading && !error && !genres.length ? <EmptyState message="No correlation data available." height={320} /> : null}

            {!loading && !error && genres.length ? (
                <Box>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Highlight row</InputLabel>
                                <Select value={selectedRow} label="Highlight row" onChange={(event) => setSelectedRow(event.target.value)}>
                                    <MenuItem value="">None</MenuItem>
                                    {genres.map((genre) => (
                                        <MenuItem key={`row-${genre}`} value={genre}>
                                            {genre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
                                <InputLabel>Highlight column</InputLabel>
                                <Select value={selectedCol} label="Highlight column" onChange={(event) => setSelectedCol(event.target.value)}>
                                    <MenuItem value="">None</MenuItem>
                                    {genres.map((genre) => (
                                        <MenuItem key={`col-${genre}`} value={genre}>
                                            {genre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ overflowX: "auto" }}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: `112px repeat(${genres.length}, minmax(52px, 1fr))`,
                                minWidth: 112 + genres.length * 52,
                                border: "1px solid rgba(232,201,126,0.08)",
                                borderRadius: 1.5,
                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ background: "rgba(232,201,126,0.06)", p: 0.8 }} />
                            {genres.map((genre) => (
                                <Box
                                    key={`head-${genre}`}
                                    sx={{
                                        p: 0.7,
                                        ...getHeaderStyles(genre),
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "primary.main",
                                            fontWeight: genre === selectedCol ? 800 : 700,
                                            fontSize: "0.58rem",
                                            lineHeight: 1.15,
                                        }}
                                    >
                                        {genre}
                                    </Typography>
                                </Box>
                            ))}

                            {genres.flatMap((rowGenre, rowIndex) => {
                                const labelCell = (
                                    <Box
                                        key={`label-${rowGenre}`}
                                        sx={{
                                            p: 0.7,
                                            display: "flex",
                                            alignItems: "center",
                                            background:
                                                rowGenre === selectedRow
                                                    ? "rgba(232,201,126,0.16)"
                                                    : rowIndex % 2
                                                      ? "rgba(255,255,255,0.02)"
                                                      : "transparent",
                                            borderTop: "1px solid rgba(232,201,126,0.05)",
                                            boxShadow:
                                                rowGenre === selectedRow ? "inset 0 0 0 1px rgba(232,201,126,0.25)" : "none",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: rowGenre === selectedRow ? 800 : 600,
                                                fontSize: "0.68rem",
                                                lineHeight: 1.15,
                                            }}
                                        >
                                            {rowGenre}
                                        </Typography>
                                    </Box>
                                );

                                const valueCells = genres.map((colGenre) => (
                                    <Tooltip
                                        key={`${rowGenre}-${colGenre}`}
                                        title={`${rowGenre} vs ${colGenre}: ${(matrix[rowGenre]?.[colGenre] ?? 0).toFixed(3)}`}
                                        arrow
                                    >
                                        <Box
                                            sx={{
                                                p: 0.7,
                                                textAlign: "center",
                                                background: correlationColor(matrix[rowGenre]?.[colGenre]),
                                                borderLeft: "1px solid rgba(232,201,126,0.05)",
                                                borderTop: "1px solid rgba(232,201,126,0.05)",
                                                ...getCellHighlightStyles(rowGenre, colGenre),
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "text.primary",
                                                    fontSize: "0.62rem",
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                {(matrix[rowGenre]?.[colGenre] ?? 0).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                ));

                                return [labelCell, ...valueCells];
                            })}
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                        <Typography variant="caption" color="text.secondary">
                            Blue: negative alignment
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Gold: positive alignment
                        </Typography>
                        {(selectedRow || selectedCol) ? (
                            <Typography variant="caption" color="primary.main">
                                Highlighting {selectedRow || "all rows"} x {selectedCol || "all columns"}
                            </Typography>
                        ) : null}
                    </Stack>
                </Box>
            ) : null}
        </Surface>
    );
}