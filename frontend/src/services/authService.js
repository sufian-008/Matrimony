import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

const verifyOTP = async (otpData) => {
  const response = await api.post('/auth/verify-otp', otpData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const updatePassword = async (passwordData) => {
  const response = await api.put('/auth/update-password', passwordData);
  return response.data;
};

const authService = {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword,
};

export default authService;
