import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Bookmark as BookmarkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileCard from '../components/common/ProfileCard';
import interactionService from '../services/interactionService';

const Shortlists = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shortlists, setShortlists] = useState([]);
  const [shortlistIds, setShortlistIds] = useState([]);

  useEffect(() => {
    loadShortlists();
  }, []);

  const loadShortlists = async () => {
    setLoading(true);
    try {
      const response = await interactionService.getShortlists();
      const data = response.data || [];
      // Filter out null profiles (in case any profile was deleted)
      const validProfiles = data.filter(profile => profile !== null);
      setShortlists(validProfiles);
      setShortlistIds(validProfiles.map(profile => profile.profileId));
    } catch (err) {
      console.error('Load shortlists error:', err);
      toast.error('Failed to load shortlists');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShortlist = async (profileId) => {
    try {
      await interactionService.removeShortlist(profileId);
      setShortlists(shortlists.filter(p => p.profileId !== profileId));
      setShortlistIds(shortlistIds.filter(id => id !== profileId));
      toast.success('Removed from shortlist');
    } catch (err) {
      console.error('Remove shortlist error:', err);
      toast.error('Failed to remove from shortlist');
    }
  };

  const handleFavorite = async (profileId) => {
    try {
      await interactionService.addFavorite(profileId);
      toast.success('Added to favorites');
    } catch (err) {
      toast.error('Failed to add to favorites');
    }
  };

  const handleInterest = async (profileId) => {
    try {
      await interactionService.sendInterest(profileId);
      toast.success('Interest sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    }
  };

  const handleMessage = (profile) => {
    navigate('/messages', { state: { selectedProfile: profile } });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BookmarkIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              My Shortlist
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {shortlists.length} {shortlists.length === 1 ? 'profile' : 'profiles'} in your shortlist
            </Typography>
          </Box>
        </Box>
      </Paper>

      {shortlists.length === 0 ? (
        <Alert severity="info">
          You haven't shortlisted any profiles yet. Browse profiles and click the bookmark icon to add them here.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {shortlists.map((profile) => (
            <Grid item key={profile.profileId} xs={12} sm={6} md={4}>
              <ProfileCard
                profile={profile}
                onInterest={handleInterest}
                onShortlist={handleRemoveShortlist}
                onFavorite={handleFavorite}
                onMessage={handleMessage}
                isFavorited={false}
                isShortlisted={shortlistIds.includes(profile.profileId)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Shortlists;
