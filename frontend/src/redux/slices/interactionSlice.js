import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shortlists: [],
  favorites: [],
  sentInterests: [],
  receivedInterests: [],
  isLoading: false,
  error: null,
};

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {},
});

export default interactionSlice.reducer;
