import api from './api';

const getMatchSuggestions = async (params) => {
  const response = await api.get('/match/suggestions', { params });
  return response.data;
};

const calculateMatch = async (profileId) => {
  const response = await api.post(`/match/calculate/${profileId}`);
  return response.data;
};

const getMyMatches = async (params) => {
  const response = await api.get('/match/my-matches', { params });
  return response.data;
};

const matchService = {
  getMatchSuggestions,
  calculateMatch,
  getMyMatches,
};

export default matchService;
