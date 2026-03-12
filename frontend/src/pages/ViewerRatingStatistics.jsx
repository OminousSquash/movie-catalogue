import { Box } from "@mui/material";
import ViewerRatingTabBar from "../components/ViewerRatingTabBar";
export default function ViewerRatingStatistics() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                pt: 6,
                px: 2,
            }}
        >
            <ViewerRatingTabBar />
        </Box>
    );
}