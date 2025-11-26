import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import searchReducer from './slices/searchSlice';
import matchReducer from './slices/matchSlice';
import interactionReducer from './slices/interactionSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    search: searchReducer,
    match: matchReducer,
    interaction: interactionReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
