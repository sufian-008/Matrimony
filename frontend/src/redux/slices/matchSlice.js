import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  matches: [],
  isLoading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {},
});

export default matchSlice.reducer;
