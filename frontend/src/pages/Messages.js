import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  Button,
  Badge,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import io from 'socket.io-client';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const socketRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);

  // Keep ref updated
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    loadConversations();

    // Initialize Socket.IO
    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = newSocket;

    if (currentUser.userId) {
      newSocket.emit('join-room', currentUser.userId);
    }

    newSocket.on('receive-message', (data) => {
      console.log('Received message:', data);
      
      // Add message to the current conversation if it matches
      // Use ref to get current value without re-subscribing
      const currentConv = selectedConversationRef.current;
      if (currentConv && data.senderId === currentConv.otherUserId) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => scrollToBottom(), 100);
      }
      
      // Always refresh conversations to update last message and unread count
      loadConversations();
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.otherUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data?.data || []);
    } catch (err) {
      console.error('Load conversations error', err);
    }
  };

  const loadMessages = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/${userId}`);
      setMessages(res.data?.data?.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Load messages error', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('Sending message to:', selectedConversation.otherUserId);
      
      const res = await api.post('/chat/send', {
        receiverId: selectedConversation.otherUserId,
        message: messageToSend,
      });

      if (res.data?.success) {
        // Add message to local state immediately
        const sentMessage = res.data.data;
        setMessages((prev) => [...prev, sentMessage]);
        
        // Scroll to bottom immediately
        setTimeout(() => scrollToBottom(), 50);
        
        // Refresh conversations list to update last message
        loadConversations();
      }
    } catch (err) {
      console.error('Send message error', err);
      // Restore message on error
      setNewMessage(messageToSend);
      alert('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'hh:mm a');
    } catch {
      return '';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Messages
      </Typography>

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" fontWeight={600}>
                Conversations
              </Typography>
            </Box>
            <List>
              {conversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No conversations yet</Typography>
                </Box>
              ) : (
                conversations.map((conv) => (
                  <React.Fragment key={conv.chatId}>
                    <ListItem
                      button
                      selected={selectedConversation?.chatId === conv.chatId}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={conv.unreadCount} color="error">
                          <Avatar src={conv.profile?.photos?.[0]?.url || '/default-avatar.png'} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          conv.profile
                            ? `${conv.profile.personalInfo?.firstName || ''} ${conv.profile.personalInfo?.lastName || ''}`
                            : 'Unknown'
                        }
                        secondary={conv.lastMessage?.text || 'No messages yet'}
                        primaryTypographyProps={{ fontWeight: conv.unreadCount > 0 ? 600 : 400 }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: '200px' },
                        }}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={selectedConversation.profile?.photos?.[0]?.url || '/default-avatar.png'}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedConversation.profile
                          ? `${selectedConversation.profile.personalInfo?.firstName || ''} ${selectedConversation.profile.personalInfo?.lastName || ''}`
                          : 'Unknown'}
                      </Typography>
                      <Typography variant="caption">
                        {selectedConversation.profile?.profileId || ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5', minHeight: 0 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
                    </Box>
                  ) : (
                    messages.map((msg, idx) => {
                      // Check if message was sent by current user
                      const isSent = msg.senderId?.toString() === currentUser.userId?.toString();
                      
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            justifyContent: isSent ? 'flex-end' : 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              maxWidth: '70%',
                              bgcolor: isSent ? 'primary.main' : 'white',
                              color: isSent ? 'white' : 'text.primary',
                            }}
                          >
                            <Typography variant="body1">{msg.message}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                              {formatTimestamp(msg.sentAt)}
                            </Typography>
                          </Paper>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input - Fixed at bottom */}
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'white', 
                    borderTop: 2, 
                    borderColor: 'primary.main', 
                    flexShrink: 0,
                    minHeight: '80px'
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Send a message...
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      variant="outlined"
                      size="medium"
                      sx={{ 
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                    <Button 
                      variant="contained"
                      color="primary" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      endIcon={<Send />}
                      sx={{ minWidth: '100px', height: '40px' }}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages;
