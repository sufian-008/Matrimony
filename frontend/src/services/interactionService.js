import api from './api';

const sendInterest = async (profileId, message) => {
  const response = await api.post(`/interaction/interest/${profileId}`, { message });
  return response.data;
};

const respondToInterest = async (interactionId, status) => {
  const response = await api.put(`/interaction/interest/${interactionId}`, { status });
  return response.data;
};

const addToShortlist = async (profileId) => {
  const response = await api.post(`/interaction/shortlist/${profileId}`);
  return response.data;
};

const removeFromShortlist = async (profileId) => {
  const response = await api.delete(`/interaction/shortlist/${profileId}`);
  return response.data;
};

const getMyShortlists = async (params) => {
  const response = await api.get('/interaction/shortlists', { params });
  return response.data;
};

const addToFavorites = async (profileId) => {
  const response = await api.post(`/interaction/favorite/${profileId}`);
  return response.data;
};

const removeFromFavorites = async (profileId) => {
  const response = await api.delete(`/interaction/favorite/${profileId}`);
  return response.data;
};

const getMyFavorites = async (params) => {
  const response = await api.get('/interaction/favorites', { params });
  return response.data;
};

const getSentInterests = async (params) => {
  const response = await api.get('/interaction/interests/sent', { params });
  return response.data;
};

const getReceivedInterests = async (params) => {
  const response = await api.get('/interaction/interests/received', { params });
  return response.data;
};

const blockUser = async (profileId) => {
  const response = await api.post(`/interaction/block/${profileId}`);
  return response.data;
};

const interactionService = {
  sendInterest,
  respondToInterest,
  addToShortlist,
  removeFromShortlist,
  getShortlists: getMyShortlists,
  getMyShortlists,
  addToFavorites,
  addFavorite: addToFavorites,
  removeFromFavorites,
  removeFavorite: removeFromFavorites,
  getFavorites: getMyFavorites,
  getMyFavorites,
  getSentInterests,
  getReceivedInterests,
  blockUser,
};

export default interactionService;
