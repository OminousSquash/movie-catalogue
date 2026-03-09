import React from "react";
import { Box } from "@mui/material";

const SIDEBAR_WIDTH = 300;

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: "1px solid",
          borderColor: "divider",
          overflowY: "auto",
          background: "background.paper",
          px: 2,
          py: 2.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: "#3a3530", borderRadius: 2 },
        }}
      >
        {children.filters}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2.5,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { background: "#3a3530", borderRadius: 3 },
        }}
      >
        {children.content}
      </Box>
    </Box>
  );
};

export default DashboardLayout;