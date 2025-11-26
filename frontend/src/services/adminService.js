import api from './api';

const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

const getAllUsers = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

const getUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

const updateUserStatus = async (userId, statusData) => {
  const response = await api.put(`/admin/users/${userId}/status`, statusData);
  return response.data;
};

const getAllProfiles = async (params) => {
  const response = await api.get('/admin/profiles', { params });
  return response.data;
};

const verifyProfile = async (profileId, verificationData) => {
  const response = await api.put(`/admin/profiles/${profileId}/verify`, verificationData);
  return response.data;
};

const getAllReports = async (params) => {
  const response = await api.get('/admin/reports', { params });
  return response.data;
};

const updateReport = async (reportId, reportData) => {
  const response = await api.put(`/admin/reports/${reportId}`, reportData);
  return response.data;
};

const getAnalytics = async (params) => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

const adminService = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getAllProfiles,
  verifyProfile,
  getAllReports,
  updateReport,
  getAnalytics,
};

export default adminService;
