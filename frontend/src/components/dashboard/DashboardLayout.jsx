import React, { useState } from "react";
import { 
  Box,
  Drawer,
  Fab,
  Tooltip,
  useMediaQuery,
  useTheme,
 } from "@mui/material";
 import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";

const SIDEBAR_WIDTH = 300;

const DashboardLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            position: "relative",
            height: "100%",
            background: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { background: "#3a3530", borderRadius: 2 },
            ...(isMobile && {
              position: "fixed",
              background: "#16161a",
              borderRight: "1px solid rgba(232,201,126,0.12)",
            }),
          },
        }}
      >
        {/* Close button — only shown on mobile */}
        {isMobile && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <Tooltip title="Close filters">
              <Box
                onClick={() => setDrawerOpen(false)}
                sx={{
                  cursor: "pointer",
                  color: "text.secondary",
                  p: 0.5,
                  borderRadius: 1,
                  "&:hover": { color: "primary.main" },
                }}
              >
                <CloseIcon fontSize="small" />
              </Box>
            </Tooltip>
          </Box>
        )}

        <Box sx={{ px: 2, py: 2.5 }}>
          {children.filters}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 2, md: 3 },
          py: 2.5,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { background: "#3a3530", borderRadius: 3 },
        }}
      >
        {children.content}
      </Box>
      {isMobile && (
        <Fab
          aria-label="open filters"
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #e8c97e 0%, #c9a84c 100%)",
            color: "#0d0d0f",
            boxShadow: "0 4px 20px rgba(232,201,126,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #f0d48e 0%, #d4a950 100%)",
            },
          }}
        >
          <TuneIcon />
        </Fab>
      )}
    </Box>
  );
};

export default DashboardLayout;