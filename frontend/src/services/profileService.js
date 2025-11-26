import api from './api';

const createProfile = async (profileData) => {
  const response = await api.post('/profile/create', profileData);
  return response.data;
};

const getMyProfile = async () => {
  const response = await api.get('/profile/my-profile');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put('/profile/update', profileData);
  return response.data;
};

const getProfileById = async (profileId) => {
  const response = await api.get(`/profile/${profileId}`);
  return response.data;
};

const viewProfile = async (profileId) => {
  const response = await api.get(`/profile/view/${profileId}`);
  return response.data;
};

const uploadPhoto = async (formData) => {
  const response = await api.post('/profile/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deletePhoto = async (photoId) => {
  const response = await api.delete(`/profile/photo/${photoId}`);
  return response.data;
};

const uploadDocument = async (formData) => {
  const response = await api.post('/profile/upload-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const updatePrivacy = async (privacySettings) => {
  const response = await api.put('/profile/privacy', privacySettings);
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/profile/stats');
  return response.data;
};

const profileService = {
  createProfile,
  getMyProfile,
  updateProfile,
  getProfileById,
  viewProfile,
  uploadPhoto,
  deletePhoto,
  uploadDocument,
  updatePrivacy,
  getDashboardStats,
};

export default profileService;
