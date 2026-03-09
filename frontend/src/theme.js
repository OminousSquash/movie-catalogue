import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0d0d0f",
      paper: "#16161a",
    },
    primary: {
      main: "#e8c97e",
      contrastText: "#0d0d0f",
    },
    secondary: {
      main: "#7e9ee8",
    },
    text: {
      primary: "#f0ece3",
      secondary: "#9a9082",
    },
    divider: "rgba(232, 201, 126, 0.12)",
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h6: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    button: { fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600, letterSpacing: "0.06em" },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#0d0d0f",
          scrollbarColor: "#3a3530 #16161a",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "#16161a" },
          "&::-webkit-scrollbar-thumb": { background: "#3a3530", borderRadius: 3 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #e8c97e 0%, #c9a84c 100%)",
          color: "#0d0d0f",
          "&:hover": { background: "linear-gradient(135deg, #f0d48e 0%, #d4a950 100%)" },
        },
        outlinedPrimary: {
          borderColor: "rgba(232, 201, 126, 0.4)",
          "&:hover": { borderColor: "#e8c97e", background: "rgba(232, 201, 126, 0.06)" },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(232, 201, 126, 0.18)" },
            "&:hover fieldset": { borderColor: "rgba(232, 201, 126, 0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#e8c97e" },
            background: "rgba(255,255,255,0.02)",
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#e8c97e" },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgba(232, 201, 126, 0.3)",
          "&.Mui-checked": { color: "#e8c97e" },
          padding: "4px 8px 4px 4px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#16161a",
          border: "1px solid rgba(232, 201, 126, 0.08)",
          "&:hover": { border: "1px solid rgba(232, 201, 126, 0.25)", transform: "translateY(-2px)" },
          transition: "border-color 0.2s, transform 0.2s",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(232, 201, 126, 0.1)" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: "0.7rem",
          height: 22,
          fontWeight: 600,
          letterSpacing: "0.04em",
        },
      },
    },
  },
});

export default theme;