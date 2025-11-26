import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Favorite, Search, Message, Verified } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: <Search sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Search',
      description: 'Find your perfect match with our advanced search and filtering options',
    },
    {
      icon: <Favorite sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Perfect Matches',
      description: 'Our algorithm suggests the most compatible profiles based on your preferences',
    },
    {
      icon: <Message sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Instant Messaging',
      description: 'Connect with your matches through our secure messaging platform',
    },
    {
      icon: <Verified sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Verified Profiles',
      description: 'All profiles are verified to ensure authenticity and safety',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h2" fontWeight={700} gutterBottom>
                  Find Your Perfect Life Partner
                </Typography>
                <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                  Join thousands of happy couples who found their soulmate through our trusted matrimony platform
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      mr: 2,
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Register Free
                  </Button>
                  <Button
                    component={Link}
                    to="/search"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Search Profiles
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="/deposit.jpg"
                  alt="Happy Couple"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" align="center" fontWeight={600} gutterBottom>
          Why Choose Us?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          We provide the best platform to find your life partner
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            {[
              { number: '10,000+', label: 'Happy Couples' },
              { number: '50,000+', label: 'Active Members' },
              { number: '100%', label: 'Verified Profiles' },
              { number: '24/7', label: 'Customer Support' },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {stat.number}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={600} gutterBottom>
          Ready to Find Your Soulmate?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Join our community today and start your journey to find true love
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          size="large"
          sx={{ mt: 2, px: 6, py: 2 }}
        >
          Get Started Now
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
