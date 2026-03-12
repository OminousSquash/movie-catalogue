
import { Box } from "@mui/material";

export default function Surface({ children, minHeight }) {
    return (
        <Box
            sx={{
                border: "1px solid rgba(232,201,126,0.1)",
                borderRadius: 2,
                background:
                    "radial-gradient(circle at top left, rgba(232,201,126,0.08), transparent 30%), #141418",
                p: { xs: 2, md: 3 },
                minHeight,
            }}
        >
            {children}
        </Box>
    );
}
