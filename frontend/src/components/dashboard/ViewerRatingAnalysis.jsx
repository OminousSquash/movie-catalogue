import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Grid, Paper, CircularProgress, MenuItem, FormControl, Select } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import api from "../../services/api";

const tabLabels = [
  "Viewer Rating Patterns",
  "Low Rating Genres",
  "Genre Correlation",
  "Conditional Ratings"
];

const ViewerRatingAnalysis = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewerHarshness, setViewerHarshness] = useState([]);
  const [lowRatingGenres, setLowRatingGenres] = useState([]);
  const [genreMatrix, setGenreMatrix] = useState([]);
  const [genres, setGenres] = useState([]);
  const [conditional, setConditional] = useState({ genreA: "", genreB: "", data: null });
  const [conditionalLoading, setConditionalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [harshRes, lowRes, matrixRes] = await Promise.all([
          api.get("/rating_analysis/viewer_harshness"),
          api.get("/rating_analysis/low_rating_genres"),
          api.get("/rating_analysis/genre_correlation_matrix"),
        ]);

        setViewerHarshness(harshRes.data);
        console.log("Viewer Harshness fetched:", harshRes.data);
        setLowRatingGenres(lowRes.data);

        const keys = Object.keys(matrixRes.data);
        const matrixData = keys.map((genre) => ({
          genre,
          ...matrixRes.data[genre],
        }));
        setGenreMatrix(matrixData);
        setGenres(keys);

      } catch (err) {
        console.error("Error fetching viewer analysis data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchConditional = async () => {
    if (!conditional.genreA || !conditional.genreB) return;
    try {
      setConditionalLoading(true);
      const res = await api.get("/rating_analysis/conditional_low_rating", {
        params: { genre_a: conditional.genreA, genre_b: conditional.genreB }
      });
      setConditional({ ...conditional, data: res.data });
    } catch (err) {
      console.error("Error fetching conditional rating:", err);
    } finally {
      setConditionalLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} centered>
        {tabLabels.map((label) => <Tab key={label} label={label} />)}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {/* TAB 0: Viewer Rating Patterns */}
        {tabIndex === 0 && (
          <Paper sx={{ height: 400, p: 2 }}>
            <ResponsivePie
              data={Array.isArray(viewerHarshness) ? viewerHarshness.map(v => ({
                id: v.rater_type,
                label: v.rater_type,
                value: v.num_users,
              })) : []}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: "pastel1" }}
              tooltip={({ datum }) => `${datum.id}: ${datum.value} users`}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 40,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemTextColor: "#000",
                },
              ]}
            />
          </Paper>
        )}

        {/* TAB 1: Low Rating Genres */}
        {tabIndex === 1 && (
          <Paper sx={{ height: 500, p: 2 }}>
            <ResponsiveBar
              data={Array.isArray(lowRatingGenres) ? lowRatingGenres : []}
              keys={["num_users_with_low_preference"]}
              indexBy="genre"
              margin={{ top: 50, right: 50, bottom: 150, left: 60 }}
              padding={0.3}
              layout="vertical"
              colors={{ scheme: "red_yellow_blue" }}
              axisBottom={{ tickRotation: -45 }}
              tooltip={({ id, value, indexValue }) => `${indexValue}: ${value} users`}
            />
          </Paper>
        )}

        {/* TAB 2: Genre Correlation */}
        {tabIndex === 2 && (
          <Paper sx={{ height: 600, p: 2 }}>
            <ResponsiveHeatMap
              data={Array.isArray(genreMatrix) ? genreMatrix : []}
              keys={Array.isArray(genres) ? genres : []}
              indexBy="genre"
              margin={{ top: 100, right: 60, bottom: 100, left: 100 }}
              forceSquare={true}
              colors={{ type: "diverging", scheme: "red_yellow_blue", minValue: 0, maxValue: 1 }}
              cellOpacity={1}
              cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
              axisTop={{ orient: "top" }}
              axisLeft={{ orient: "left" }}
              tooltip={({ xKey, yKey, value }) => `${yKey} & ${xKey}: ${value.toFixed(2)}`}
            />
          </Paper>
        )}

        {/* TAB 3: Conditional Ratings */}
        {tabIndex === 3 && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Select
                    value={conditional.genreA}
                    onChange={(e) => setConditional({ ...conditional, genreA: e.target.value, data: null })}
                  >
                    {genres.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Select
                    value={conditional.genreB}
                    onChange={(e) => setConditional({ ...conditional, genreB: e.target.value, data: null })}
                  >
                    {genres.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <button onClick={fetchConditional}>Check Conditional Probability</button>
                  {conditionalLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>
                {conditional.data && (
                  <Box sx={{ mt: 2 }}>
                    <Typography>
                      Probability that a viewer rates <b>{conditional.genreB}</b> low given they rated <b>{conditional.genreA}</b> low: {conditional.data.probability}
                    </Typography>
                    <Typography>Sample size: {conditional.data.sample_size}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ViewerRatingAnalysis;