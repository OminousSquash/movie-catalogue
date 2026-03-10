import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MovieIcon from '@mui/icons-material/Movie';
import { useNavigate } from "react-router-dom";

const common_pages = [{label: "Dashboard", path: "/"}, {label: "View Lists", path: "/view-lists"}];
const auth_settings = [{label: "Your Lists", path: "/user-lists"}, {label: "Logout", path: null}];

function NavBar({ isAuthenticated, onLoginClick, onLogout }) {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const navigate = useNavigate();

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const handleNavClick = (path) => {
      handleCloseNavMenu();
      navigate(path);
    };

    const handleSettingClick = (setting) => {
      handleCloseUserMenu();
      if (setting.label === "Logout"){
        onLogout?.();
      } else if (setting.path){
        navigate(setting.path);
      }
    };
    return (
    <AppBar position="static"
    sx={{
        background: "linear-gradient(90deg, #111010 0%, #1a1810 100%)",
        borderBottom: "1px solid rgba(232, 201, 126, 0.15)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.6)",
    }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <MovieIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate("/")}

            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              letterSpacing: '.15rem',
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="Navigation menwu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="primary.main"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  background: "#16161a",
                  border: "1px solid rgba(232,201,126,0.15)",
                  minWidth: 160,
                },
              }}
            
            >
              {common_pages.map((page) => (
                <MenuItem key={page.label} onClick={() => handleNavClick(page.path)}
                sx={{ '&:hover': { background: 'rgba(232,201,126,0.08' } }}>
                  <Typography sx={{ color: 'text.primary', fontSize: '0.9 rem' }}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <MovieIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {common_pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => {handleNavClick(page.path)}}
                sx={{ color: 'text.secondary', fontSize: '0.85rem', '&:hover': { color: 'primary.main', background: 'rgba(232, 201, 126, 0.06) '}, }}
              >
                {page.label}
              </Button>
            ))}
          </Box>
          {isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Account">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      background: "linear-gradient(135deg, #e8c97e, #c9a84c)",
                      color: "#0d0d0f",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
                </Tooltip>
              <Menu
                sx={{
                  mt: "45px",
                  "& .MuiPaper-root": {
                    background: "#16161a",
                    border: "1px solid rgba(232,201,126,0.15)",
                    minWidth: 150,
                  },
                }}
                id="menu-user"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {auth_settings.map((setting) => (
                  <MenuItem
                    key={setting.label}
                    onClick={() => handleSettingClick(setting)}
                    sx={{ "&:hover": { background: "rgba(232,201,126,0.08)" } }}
                  >
                    <Typography
                      sx={{
                        color: setting.label === "Logout" ? "error.main" : "text.primary",
                        fontSize: "0.9rem",
                      }}
                    >
                      {setting.label}
                    </Typography>
                  </MenuItem>
                ))}
                </Menu>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onLoginClick}
              sx={{ fontSize: "0.8rem" }}
            >
              Login / Sign Up
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
