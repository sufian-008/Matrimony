import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  messages: [],
  activeChat: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setActiveChat, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
