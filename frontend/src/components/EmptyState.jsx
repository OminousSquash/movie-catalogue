import { Box, Typography } from "@mui/material";

export default function EmptyState({ message, height = 220 }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: height, opacity: 0.65 }}>
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
}
