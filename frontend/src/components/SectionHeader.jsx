import { Box, Chip, Stack, Typography } from "@mui/material";

export default function SectionHeader({ icon, title, subtitle, chip }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {icon}
                    <Box>
                        <Typography variant="h5" sx={{ fontFamily: "Playfair Display, serif" }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>
                {chip ? (
                    <Chip
                        label={chip}
                        size="small"
                        sx={{
                            color: "primary.main",
                            background: "rgba(232,201,126,0.08)",
                            border: "1px solid rgba(232,201,126,0.18)",
                        }}
                    />
                ) : null}
            </Stack>
        </Box>
    );
}