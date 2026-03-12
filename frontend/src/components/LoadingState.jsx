import { Box, CircularProgress } from "@mui/material";

export default function LoadingState({ height = 220 }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: height }}>
            <CircularProgress color="primary" size={32} thickness={2.5} />
        </Box>
    );
}
