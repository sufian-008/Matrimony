import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Favorite,
  Message,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

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

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/');
  };

  const guestPages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  const userPages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Search', path: '/search' },
    { name: 'Matches', path: '/matches' },
    { name: 'Interests', path: '/interests' },
  ];

  const adminPages = [
    { name: 'Admin Dashboard', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Profiles', path: '/admin/profiles' },
    { name: 'Reports', path: '/admin/reports' },
  ];

  // Determine which pages to show based on user role
  const pages = isAuthenticated 
    ? (user?.role === 'admin' ? adminPages : userPages)
    : guestPages;

  return (
    <AppBar position="fixed" elevation={2} sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Favorite sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            Matrimony
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
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
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    component={Link}
                    to={page.path}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Favorite sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            Matrimony
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{ my: 2, color: 'text.primary', display: 'block', mx: 1 }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }}>
              <Tooltip title="Messages">
                <IconButton component={Link} to="/messages" color="inherit">
                  <Badge badgeContent={0} color="error">
                    <Message />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={0} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                  <Avatar alt={user?.email} sx={{ bgcolor: 'primary.main' }}>
                    <AccountCircle />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { navigate('/profile/edit'); handleCloseUserMenu(); }}>
                  <Typography textAlign="center">My Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/shortlists'); handleCloseUserMenu(); }}>
                  <Typography textAlign="center">Shortlists</Typography>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/favorites'); handleCloseUserMenu(); }}>
                  <Typography textAlign="center">Favorites</Typography>
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin/dashboard'); handleCloseUserMenu(); }}>
                    <Typography textAlign="center">Admin Panel</Typography>
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
