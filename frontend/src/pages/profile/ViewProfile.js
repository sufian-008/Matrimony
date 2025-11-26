import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Message,
  Favorite,
  Bookmark,
  ArrowBack,
  ThumbUp,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import interactionService from '../../services/interactionService';
import { calculateAge } from '../../utils/helpers';

export default function ViewProfile() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Use /profile/view to increment view count
      const res = await api.get(`/profile/view/${profileId}`);
      setProfile(res.data?.data);
    } catch (err) {
      console.error('Load profile error', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    
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

  const handleInterest = async () => {
    if (!profile) return;
    
    try {
      await interactionService.sendInterest(profile.profileId);
      toast.success('Interest sent successfully!');
    } catch (err) {
      console.error('Send interest error', err);
      toast.error(err.response?.data?.message || 'Failed to send interest');
    }
  };

  const handleFavorite = async () => {
    if (!profile) return;
    
    try {
      await interactionService.addToFavorites(profile.profileId);
      toast.success('Added to favorites!');
    } catch (err) {
      console.error('Add to favorites error', err);
      toast.error(err.response?.data?.message || 'Failed to add to favorites');
    }
  };

  const handleShortlist = async () => {
    if (!profile) return;
    
    try {
      await interactionService.addToShortlist(profile.profileId);
      toast.success('Added to shortlist!');
    } catch (err) {
      console.error('Add to shortlist error', err);
      toast.error(err.response?.data?.message || 'Failed to add to shortlist');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Profile not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const age = calculateAge(profile.personalInfo?.dateOfBirth);
  const profilePhoto = profile.photos?.find(p => p.isProfile)?.url || 
                       profile.photos?.[0]?.url || 
                       '/default-avatar.png';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Profile Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Photos & Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Avatar
              src={profilePhoto}
              sx={{ width: '100%', height: 'auto', aspectRatio: '1', mb: 2 }}
              variant="rounded"
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ThumbUp />}
                onClick={handleInterest}
                fullWidth
              >
                Send Interest
              </Button>

              <Button
                variant="contained"
                size="large"
                startIcon={<Message />}
                onClick={handleMessage}
                fullWidth
              >
                Send Message
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Favorite />}
                onClick={handleFavorite}
                fullWidth
              >
                Add to Favorites
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Bookmark />}
                onClick={handleShortlist}
                fullWidth
              >
                Shortlist
              </Button>
            </Box>

            {/* Verification Status */}
            {profile.verification?.idVerified && (
              <Box sx={{ mt: 2 }}>
                <Chip label="ID Verified" color="success" size="small" />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Profile Details */}
        <Grid item xs={12} md={8}>
          {/* Basic Info */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {profile.personalInfo?.firstName} {profile.personalInfo?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profile.profileId}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip label={`${age} years`} />
              <Chip label={profile.personalInfo?.gender} />
              <Chip label={profile.personalInfo?.maritalStatus} />
              <Chip label={`${profile.personalInfo?.height} cm`} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Religion
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.religiousBackground?.religion}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Mother Tongue
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.personalInfo?.motherTongue}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Professional Info */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Professional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Education
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.professionalInfo?.education}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Occupation
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.professionalInfo?.occupation}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Annual Income
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ₹ {profile.professionalInfo?.annualIncome?.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Location */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Location
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1">
              {profile.location?.city}, {profile.location?.state}, {profile.location?.country}
            </Typography>
          </Paper>

          {/* About */}
          {profile.personalInfo?.about && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {profile.personalInfo.about}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

