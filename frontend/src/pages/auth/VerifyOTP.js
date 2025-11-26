import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { verifyOTP, clearError } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await dispatch(verifyOTP({ email, otp })).unwrap();
      toast.success('Email verified successfully!');
      navigate('/profile/create');
    } catch (err) {
      toast.error(err || 'OTP verification failed');
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(email);
      toast.success('OTP resent successfully!');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  React.useEffect(() => {
    if (!email) {
      navigate('/register');
    }
    return () => {
      dispatch(clearError());
    };
  }, [email, navigate, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've sent a 6-digit OTP to
          </Typography>
          <Typography variant="body1" fontWeight={600} color="primary.main">
            {email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
            required
            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '10px' } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Didn't receive the code?{' '}
              <Button
                onClick={handleResendOTP}
                variant="text"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Resend OTP
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyOTP;
