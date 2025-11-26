// Placeholder pages - these would be fully implemented with proper UI

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Favorite,
  Visibility,
  ThumbUp,
  Message,
  Person,
  Search,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import profileService from '../services/profileService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [hasProfile, setHasProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [stats, setStats] = useState({
    profileViews: 0,
    interests: 0,
    shortlists: 0,
    matches: 0,
  });

  useEffect(() => {
    // Check if user has a profile
    const checkProfile = async () => {
      try {
        const response = await profileService.getMyProfile();
        if (response.success && response.data) {
          setHasProfile(true);
          // Calculate profile completion (simplified)
          const profile = response.data;
          let completed = 0;
          if (profile.personalInfo?.firstName) completed += 20;
          if (profile.personalInfo?.dateOfBirth) completed += 20;
          if (profile.professionalInfo?.education) completed += 20;
          if (profile.location?.city) completed += 20;
          if (profile.photos && profile.photos.length > 0) completed += 20;
          setProfileCompletion(completed);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        }
      }
    };

    const fetchStats = async () => {
      try {
        const response = await profileService.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Keep default stats if fetch fails
        setStats({
          profileViews: 0,
          interests: 0,
          shortlists: 0,
          matches: 0,
        });
      }
    };

    checkProfile();
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: color, mr: 2 }}>
              <Icon />
            </Avatar>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <Button
      variant="outlined"
      fullWidth
      startIcon={<Icon />}
      onClick={onClick}
      sx={{
        py: 1.5,
        borderColor: `${color}50`,
        color: color,
        '&:hover': {
          borderColor: color,
          bgcolor: `${color}10`,
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* No Profile Alert */}
      {hasProfile === false && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={600}>
            You haven't created your profile yet!
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Create your profile to start searching for matches and let others find you.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/profile/create')}
            sx={{ mt: 2 }}
          >
            Create Profile Now
          </Button>
        </Alert>
      )}

      {/* Welcome Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome Back!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {user?.email || 'User'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={profileCompletion === 100 ? 'Profile Complete' : 'Profile Incomplete'}
                size="small"
                sx={{ 
                  bgcolor: profileCompletion === 100 ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.3)', 
                  color: 'white' 
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Completion */}
      {hasProfile && profileCompletion < 100 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete your profile to get better matches
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={profileCompletion} 
            sx={{ mb: 1, height: 8, borderRadius: 4 }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption">{profileCompletion}% Complete</Typography>
            <Typography variant="caption" color="primary">{100 - profileCompletion}% remaining</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/profile/edit')}
            fullWidth
          >
            Complete Profile Now
          </Button>
        </Paper>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Visibility}
            title="Profile Views"
            value={stats.profileViews}
            color="#2196f3"
            onClick={() => {}}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ThumbUp}
            title="Interests Received"
            value={stats.interests}
            color="#4caf50"
            onClick={() => navigate('/interests')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Favorite}
            title="Shortlisted"
            value={stats.shortlists}
            color="#f44336"
            onClick={() => navigate('/shortlists')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Person}
            title="Matches"
            value={stats.matches}
            color="#ff9800"
            onClick={() => navigate('/matches')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  icon={Search}
                  label="Search Profiles"
                  onClick={() => navigate('/search')}
                  color="#e91e63"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  icon={TrendingUp}
                  label="View Matches"
                  onClick={() => navigate('/matches')}
                  color="#9c27b0"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  icon={Message}
                  label="Messages"
                  onClick={() => navigate('/messages')}
                  color="#2196f3"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  icon={Person}
                  label="Edit Profile"
                  onClick={() => navigate('/profile/edit')}
                  color="#4caf50"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No recent activity
            </Typography>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Premium Features
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upgrade to premium for unlimited access
            </Typography>
            <Button variant="contained" color="warning" fullWidth>
              Upgrade Now
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
