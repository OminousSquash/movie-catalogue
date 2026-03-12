import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ViewerRatingGeneralStats from "../pages/ViewerRatingGeneralStats";
import ViewerRatingGenreCorrelation from "../pages/ViewerRatingGenreCorrelation";
import ViewerRatingLowRatedGenres from "../pages/ViewerRatingLowRatedGenres";
import ViewerRatingPairExplorer from "../pages/ViewerRatingPairExplorer";

export default function ViewerRatingTabBar() {
    const [value, setValue] = useState(0);

    const tabs = [
        { label: "Viewer Harshness"},
        { label: "Low Rating Genres"},
        { label: "Genre Correlation" },
        { label: "Pair Explorer"}
    ];

    const tabComponents = [
        <ViewerRatingGeneralStats />,
        <ViewerRatingLowRatedGenres />,
        <ViewerRatingGenreCorrelation />,
        <ViewerRatingPairExplorer />
    ];

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <Box width="100%">
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tabs value={value} onChange={handleChange} centered>
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                {tabComponents[value]}
            </Box>
        </Box>
    );
}