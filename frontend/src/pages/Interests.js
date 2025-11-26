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
  Alert,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { Send, Inbox, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import interactionService from '../services/interactionService';

const Interests = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);

  const loadInterests = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        // Sent interests
        const response = await interactionService.getSentInterests();
        setSentInterests(response.data || []);
      } else {
        // Received interests
        const response = await interactionService.getReceivedInterests();
        setReceivedInterests(response.data || []);
      }
    } catch (err) {
      console.error('Load interests error:', err);
      toast.error('Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleAcceptInterest = async (interestId) => {
    try {
      await interactionService.respondToInterest(interestId, 'accepted');
      toast.success('Interest accepted!');
      loadInterests();
    } catch (err) {
      toast.error('Failed to accept interest');
    }
  };

  const handleRejectInterest = async (interestId) => {
    try {
      await interactionService.respondToInterest(interestId, 'rejected');
      toast.success('Interest rejected');
      loadInterests();
    } catch (err) {
      toast.error('Failed to reject interest');
    }
  };

  const handleViewProfile = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const renderInterestCard = (interest, isSent = false) => {
    const profile = isSent ? interest.toProfile : interest.fromProfile;
    if (!profile) return null;

    const profilePhoto = profile.photos?.find(p => p.isProfile)?.url || profile.photos?.[0]?.url;
    const imageUrl = profilePhoto && profilePhoto.startsWith('/uploads')
      ? `${API_URL}${profilePhoto}`
      : profilePhoto || '/default-avatar.png';

    const name = `${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}`;
    const location = `${profile.location?.city}, ${profile.location?.state}`;

    return (
      <Grid item xs={12} sm={6} md={4} key={interest._id}>
        <Card sx={{ height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={imageUrl}
              alt={name}
              sx={{ width: 64, height: 64 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Box>
          </Box>

          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={interest.status.toUpperCase()}
                color={getStatusColor(interest.status)}
                size="small"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              🎓 {profile.professionalInfo?.education}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              💼 {profile.professionalInfo?.occupation}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(interest.createdAt).toLocaleDateString()}
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewProfile(profile.profileId)}
                fullWidth
              >
                View Profile
              </Button>
              
              {!isSent && interest.status === 'pending' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleAcceptInterest(interest._id)}
                    fullWidth
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleRejectInterest(interest._id)}
                    fullWidth
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const interests = tab === 0 ? sentInterests : receivedInterests;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Interests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your sent and received interests
        </Typography>

        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{ mt: 2 }}
        >
          <Tab icon={<Send />} label="Sent" iconPosition="start" />
          <Tab icon={<Inbox />} label="Received" iconPosition="start" />
        </Tabs>
      </Paper>

      {interests.length === 0 ? (
        <Alert severity="info">
          {tab === 0
            ? "You haven't sent any interests yet. Browse profiles and send interests to connect!"
            : "No interests received yet. Complete your profile to receive more interests."}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {interests.map((interest) => renderInterestCard(interest, tab === 0))}
        </Grid>
      )}
    </Container>
  );
};

export default Interests;
