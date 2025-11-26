import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Favorite } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Favorite sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700}>
                Matrimony
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400">
              Find your perfect life partner with our trusted matrimony service. 
              We help thousands of people find their soulmates every year.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Home
                </Typography>
              </Link>
              <Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Search
                </Typography>
              </Link>
              <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  About Us
                </Typography>
              </Link>
              <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Contact
                </Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/help" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Help Center
                </Typography>
              </Link>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Privacy Policy
                </Typography>
              </Link>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  Terms of Service
                </Typography>
              </Link>
              <Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'primary.main' } }}>
                  FAQ
                </Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: 'grey.700' }} />

        <Typography variant="body2" color="grey.400" align="center">
          © {new Date().getFullYear()} Matrimony. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
