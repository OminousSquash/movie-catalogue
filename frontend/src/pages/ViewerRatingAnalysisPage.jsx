import React from "react";
import { Container, Typography } from "@mui/material";
import ViewerRatingAnalysis from "../components/dashboard/ViewerRatingAnalysis.jsx";

export default function ViewerRatingAnalysisPage() {
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Viewer Rating Analysis
      </Typography>
      <ViewerRatingAnalysis />
    </Container>
  );
}