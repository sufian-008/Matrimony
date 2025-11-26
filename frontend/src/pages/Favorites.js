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
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileCard from '../components/common/ProfileCard';
import interactionService from '../services/interactionService';

const Favorites = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await interactionService.getFavorites();
      const data = response.data || [];
      // Filter out null profiles (in case any profile was deleted)
      const validProfiles = data.filter(profile => profile !== null);
      setFavorites(validProfiles);
      setFavoriteIds(validProfiles.map(profile => profile.profileId));
    } catch (err) {
      console.error('Load favorites error:', err);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (profileId) => {
    try {
      await interactionService.removeFavorite(profileId);
      setFavorites(favorites.filter(p => p.profileId !== profileId));
      setFavoriteIds(favoriteIds.filter(id => id !== profileId));
      toast.success('Removed from favorites');
    } catch (err) {
      console.error('Remove favorite error:', err);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleShortlist = async (profileId) => {
    try {
      await interactionService.addShortlist(profileId);
      toast.success('Added to shortlist');
    } catch (err) {
      toast.error('Failed to add to shortlist');
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
          <FavoriteIcon color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              My Favorites
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {favorites.length} {favorites.length === 1 ? 'profile' : 'profiles'} in your favorites
            </Typography>
          </Box>
        </Box>
      </Paper>

      {favorites.length === 0 ? (
        <Alert severity="info">
          You haven't added any profiles to your favorites yet. Browse profiles and click the heart icon to add them here.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((profile) => (
            <Grid item key={profile.profileId} xs={12} sm={6} md={4}>
              <ProfileCard
                profile={profile}
                onInterest={handleInterest}
                onShortlist={handleShortlist}
                onFavorite={handleRemoveFavorite}
                onMessage={handleMessage}
                isFavorited={favoriteIds.includes(profile.profileId)}
                isShortlisted={false}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites;
