import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { ExpandMore, Search as SearchIcon, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileCard from '../components/common/ProfileCard';
import api from '../services/api';
import interactionService from '../services/interactionService';

const Search = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: [21, 35],
    heightRange: [150, 180],
    maritalStatus: '',
    religion: '',
    education: '',
    occupation: '',
    location: '',
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Use dev public profiles endpoint in development
      const res = await api.get('/dev/profiles');
      const data = res.data?.data || [];
      setProfiles(data);
    } catch (err) {
      console.error('Load profiles error', err);
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

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Search Profiles
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Find your perfect match using advanced filters
      </Typography>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Filters
              </Typography>
            </Box>

            {/* Basic Filters */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Basic Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={filters.gender}
                    label="Gender"
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>

                <Typography gutterBottom>Age Range</Typography>
                <Slider
                  value={filters.ageRange}
                  onChange={(e, value) => handleFilterChange('ageRange', value)}
                  valueLabelDisplay="auto"
                  min={18}
                  max={60}
                  sx={{ mb: 2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {filters.ageRange[0]} - {filters.ageRange[1]} years
                </Typography>

                <Typography gutterBottom sx={{ mt: 2 }}>Height Range (cm)</Typography>
                <Slider
                  value={filters.heightRange}
                  onChange={(e, value) => handleFilterChange('heightRange', value)}
                  valueLabelDisplay="auto"
                  min={140}
                  max={200}
                  sx={{ mb: 2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {filters.heightRange[0]} - {filters.heightRange[1]} cm
                </Typography>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    value={filters.maritalStatus}
                    label="Marital Status"
                    onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="never_married">Never Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Professional Details */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Professional</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Education"
                  value={filters.education}
                  onChange={(e) => handleFilterChange('education', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Occupation"
                  value={filters.occupation}
                  onChange={(e) => handleFilterChange('occupation', e.target.value)}
                />
              </AccordionDetails>
            </Accordion>

            {/* Location */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Location</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, State, Country"
                />
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{ mb: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({
                  gender: '',
                  ageRange: [21, 35],
                  heightRange: [150, 180],
                  maritalStatus: '',
                  religion: '',
                  education: '',
                  occupation: '',
                  location: '',
                })}
              >
                Reset Filters
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Search Results */}
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                {profiles.length} Profiles Found
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select defaultValue="match" label="Sort By">
                  <MenuItem value="match">Best Match</MenuItem>
                  <MenuItem value="recent">Recently Active</MenuItem>
                  <MenuItem value="age">Age</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : profiles.length === 0 ? (
            <Paper elevation={2} sx={{ p: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No profiles found matching your criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {profiles.map((profile) => (
                <Grid item xs={12} sm={6} lg={4} key={profile._id || profile.profileId}>
                  <ProfileCard 
                    profile={profile}
                    onMessage={handleMessage}
                    onInterest={handleInterest}
                    onShortlist={handleShortlist}
                    onFavorite={handleFavorite}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Search;
