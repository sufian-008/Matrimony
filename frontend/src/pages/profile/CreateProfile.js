import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import profileService from '../../services/profileService';
import api from '../../services/api';

const steps = ['Personal Info', 'Professional Info', 'Location & Religious Info', 'Upload Photo'];

const CreateProfile = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      height: '',
      motherTongue: '',
      bio: '',
    },
    professionalInfo: {
      education: '',
      occupation: '',
      employedIn: '',
      annualIncome: '',
    },
    location: {
      country: '',
      state: '',
      city: '',
    },
    religiousInfo: {
      religion: '',
      caste: '',
    },
    lifestyle: {
      diet: '',
      smoking: '',
      drinking: '',
    },
  });

  const handleChange = (section, field) => (event) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: event.target.value,
      },
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // First create the profile
      await profileService.createProfile(formData);
      
      // If photo is selected, upload it
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photoFile);
        
        try {
          await api.post('/profile/upload-photo', photoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (photoErr) {
          console.error('Photo upload error:', photoErr);
          // Don't fail if photo upload fails
          toast.warning('Profile created but photo upload failed');
        }
      }
      
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create profile';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.personalInfo.firstName}
                onChange={handleChange('personalInfo', 'firstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.personalInfo.lastName}
                onChange={handleChange('personalInfo', 'lastName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={formData.personalInfo.dateOfBirth}
                onChange={handleChange('personalInfo', 'dateOfBirth')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.personalInfo.gender}
                  label="Gender"
                  onChange={handleChange('personalInfo', 'gender')}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.personalInfo.maritalStatus}
                  label="Marital Status"
                  onChange={handleChange('personalInfo', 'maritalStatus')}
                >
                  <MenuItem value="never_married">Never Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
                  <MenuItem value="separated">Separated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Height (cm)"
                value={formData.personalInfo.height}
                onChange={handleChange('personalInfo', 'height')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother Tongue"
                value={formData.personalInfo.motherTongue}
                onChange={handleChange('personalInfo', 'motherTongue')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                placeholder="Tell us about yourself..."
                value={formData.personalInfo.bio}
                onChange={handleChange('personalInfo', 'bio')}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Education"
                placeholder="e.g., B.Tech, MBA, M.Sc"
                value={formData.professionalInfo.education}
                onChange={handleChange('professionalInfo', 'education')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Occupation"
                placeholder="e.g., Software Engineer"
                value={formData.professionalInfo.occupation}
                onChange={handleChange('professionalInfo', 'occupation')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employed In</InputLabel>
                <Select
                  value={formData.professionalInfo.employedIn}
                  label="Employed In"
                  onChange={handleChange('professionalInfo', 'employedIn')}
                >
                  <MenuItem value="government">Government</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="self_employed">Self Employed</MenuItem>
                  <MenuItem value="not_working">Not Working</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Income"
                placeholder="e.g., 5-10 LPA"
                value={formData.professionalInfo.annualIncome}
                onChange={handleChange('professionalInfo', 'annualIncome')}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Country"
                value={formData.location.country}
                onChange={handleChange('location', 'country')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="State"
                value={formData.location.state}
                onChange={handleChange('location', 'state')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="City"
                value={formData.location.city}
                onChange={handleChange('location', 'city')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Religion"
                value={formData.religiousInfo.religion}
                onChange={handleChange('religiousInfo', 'religion')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Caste"
                value={formData.religiousInfo.caste}
                onChange={handleChange('religiousInfo', 'caste')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Diet</InputLabel>
                <Select
                  value={formData.lifestyle.diet}
                  label="Diet"
                  onChange={handleChange('lifestyle', 'diet')}
                >
                  <MenuItem value="vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="non_vegetarian">Non-Vegetarian</MenuItem>
                  <MenuItem value="eggetarian">Eggetarian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Smoking</InputLabel>
                <Select
                  value={formData.lifestyle.smoking}
                  label="Smoking"
                  onChange={handleChange('lifestyle', 'smoking')}
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="occasionally">Occasionally</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Drinking</InputLabel>
                <Select
                  value={formData.lifestyle.drinking}
                  label="Drinking"
                  onChange={handleChange('lifestyle', 'drinking')}
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="occasionally">Occasionally</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom textAlign="center">
                Upload Profile Photo
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Add a clear photo of yourself (Optional but recommended)
              </Typography>
            </Grid>
            
            <Grid item xs={12} display="flex" flexDirection="column" alignItems="center">
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={photoPreview}
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    border: '4px solid',
                    borderColor: 'primary.main',
                  }}
                />
                {photoPreview && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                    size="small"
                    onClick={handleRemovePhoto}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
              
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Max file size: 5MB. Formats: JPG, PNG
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center">
          Create Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Fill in the details to create your matrimony profile
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Profile'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProfile;
