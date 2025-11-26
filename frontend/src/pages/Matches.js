import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
} from '@mui/material';
import { People, Star, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileCard from '../components/common/ProfileCard';
import api from '../services/api';
import interactionService from '../services/interactionService';

const Matches = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dev/profiles');
      const data = res.data?.data || [];
      // For simplicity, treat all returned profiles as matches; if tab is premium filter isPremium
      const filtered = tab === 1 ? data.filter(p => p.isPremium) : data;
      setMatches(filtered);
    } catch (err) {
      console.error('Load matches error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (profile) => {
    try {
      // Send initial message to start conversation
      await api.post('/chat/send', {
        receiverId: profile.userId,
        message: `Hi ${profile.personalInfo?.firstName}! I'm interested in your profile.`,
      });
      
      toast.success('Conversation started! Redirecting to messages...');
      setTimeout(() => {
        navigate('/messages');
      }, 1000);
    } catch (err) {
      console.error('Start conversation error', err);
      toast.error('Failed to start conversation');
    }
  };

  const handleInterest = async (profileId) => {
    try {
      await interactionService.sendInterest(profileId);
      toast.success('Interest sent successfully!');
    } catch (err) {
      console.error('Send interest error', err);
      toast.error(err.response?.data?.message || 'Failed to send interest');
    }
  };

  const handleShortlist = async (profileId) => {
    try {
      await interactionService.addToShortlist(profileId);
      toast.success('Added to shortlist!');
    } catch (err) {
      console.error('Add to shortlist error', err);
      toast.error(err.response?.data?.message || 'Failed to add to shortlist');
    }
  };

  const handleFavorite = async (profileId) => {
    try {
      await interactionService.addToFavorites(profileId);
      toast.success('Added to favorites!');
    } catch (err) {
      console.error('Add to favorites error', err);
      toast.error(err.response?.data?.message || 'Failed to add to favorites');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Your Matches
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered compatibility matches based on your preferences
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          variant="fullWidth"
        >
          <Tab
            icon={<TrendingUp />}
            iconPosition="start"
            label="All Matches"
          />
          <Tab
            icon={<Star />}
            iconPosition="start"
            label="Premium Matches"
          />
          <Tab
            icon={<People />}
            iconPosition="start"
            label="Mutual Matches"
          />
        </Tabs>
      </Paper>

      {/* Match Score Legend */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Match Score Guide:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label="90-100% Excellent"
            size="small"
            sx={{ bgcolor: '#4caf50', color: 'white' }}
          />
          <Chip
            label="75-89% Very Good"
            size="small"
            sx={{ bgcolor: '#2196f3', color: 'white' }}
          />
          <Chip
            label="60-74% Good"
            size="small"
            sx={{ bgcolor: '#ff9800', color: 'white' }}
          />
          <Chip
            label="<60% Fair"
            size="small"
            sx={{ bgcolor: '#f44336', color: 'white' }}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : matches.length === 0 ? (
        <Paper elevation={2} sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No matches found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your profile to get better matches
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <ProfileCard 
                profile={match} 
                showMatchScore
                onMessage={handleMessage}
                onInterest={handleInterest}
                onShortlist={handleShortlist}
                onFavorite={handleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Matches;
