import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  users: [],
  profiles: [],
  reports: [],
  analytics: null,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
});

export default adminSlice.reducer;
