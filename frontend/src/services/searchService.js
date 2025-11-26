import api from './api';

const basicSearch = async (params) => {
  const response = await api.get('/search/basic', { params });
  return response.data;
};

const advancedSearch = async (searchData) => {
  const response = await api.post('/search/advanced', searchData);
  return response.data;
};

const searchById = async (profileId) => {
  const response = await api.get(`/search/by-id/${profileId}`);
  return response.data;
};

const getRecommendations = async (params) => {
  const response = await api.get('/search/recommendations', { params });
  return response.data;
};

const searchService = {
  basicSearch,
  advancedSearch,
  searchById,
  getRecommendations,
};

export default searchService;
