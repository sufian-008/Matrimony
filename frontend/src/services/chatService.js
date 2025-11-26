import api from './api';

const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

const getMessages = async (userId, params) => {
  const response = await api.get(`/chat/${userId}`, { params });
  return response.data;
};

const sendMessage = async (messageData) => {
  const response = await api.post('/chat/send', messageData);
  return response.data;
};

const markAsRead = async (chatId) => {
  const response = await api.put(`/chat/mark-read/${chatId}`);
  return response.data;
};

const chatService = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
};

export default chatService;
