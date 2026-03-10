import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography } from "@mui/material";
import { ResponsiveHeatMap } from "@nivo/heatmap";

const ViewerRatingPatterns = () => {
  const [viewerHarshness, setViewerHarshness] = useState([]);
  const [lowRatingGenres, setLowRatingGenres] = useState([]);
  const [genreMatrix, setGenreMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const harshnessRes = await axios.get(
          "http://localhost:8000/rating_analysis/viewer_harshness"
        );
        const lowGenresRes = await axios.get(
          "http://localhost:8000/rating_analysis/low_rating_genres"
        );
        const correlationRes = await axios.get(
          "http://localhost:8000/rating_analysis/genre_correlation_matrix"
        );

        setViewerHarshness(harshnessRes.data);
        setLowRatingGenres(lowGenresRes.data);
        setGenreMatrix(correlationRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch rating data:", err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Typography>Loading viewer rating patterns...</Typography>;

  const heatmapData = Object.keys(genreMatrix).map((genre) => ({
    genre,
    ...genreMatrix[genre],
  }));

  return (
    <Grid container spacing={2}>
      {/* Viewer Harshness */}
      <Grid xs={12} md={4}>
        <Paper style={{ padding: 16 }}>
          <Typography variant="h6">Viewer Harshness</Typography>
          <ul>
            {viewerHarshness.map((v) => (
              <li key={v.rater_type}>
                {v.rater_type}: {v.num_users} users
              </li>
            ))}
          </ul>
        </Paper>
      </Grid>

      {/* Low Rating Genres */}
      <Grid xs={12} md={4}>
        <Paper style={{ padding: 16 }}>
          <Typography variant="h6">Genres with Low Ratings</Typography>
          <ul>
            {lowRatingGenres.map((g) => (
              <li key={g.genre}>
                {g.genre}: {g.num_users_with_low_preference} users
              </li>
            ))}
          </ul>
        </Paper>
      </Grid>

      {/* Genre Correlation Heatmap */}
      <Grid xs={12} md={12} style={{ height: 500 }}>
        <Paper style={{ height: "100%", padding: 16 }}>
          <Typography variant="h6">Genre Correlation Matrix</Typography>
          <ResponsiveHeatMap
            data={heatmapData}
            keys={Object.keys(genreMatrix)}
            indexBy="genre"
            margin={{ top: 100, right: 60, bottom: 60, left: 100 }}
            forceSquare={true}
            colors={{ type: "diverging", scheme: "red_yellow_blue", divergeAt: 0.5 }}
            axisTop={{
              orient: "top",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "",
              legendOffset: 36,
            }}
            axisLeft={{
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: -40,
            }}
            cellOpacity={1}
            cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
            animate={true}
            motionConfig="wobbly"
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ViewerRatingPatterns;