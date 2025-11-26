import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import searchService from '../../services/searchService';

const initialState = {
  results: [],
  recommendations: [],
  isLoading: false,
  error: null,
  pagination: null,
};

export const basicSearch = createAsyncThunk(
  'search/basic',
  async (params, thunkAPI) => {
    try {
      const response = await searchService.basicSearch(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const advancedSearch = createAsyncThunk(
  'search/advanced',
  async (params, thunkAPI) => {
    try {
      const response = await searchService.advancedSearch(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRecommendations = createAsyncThunk(
  'search/recommendations',
  async (params, thunkAPI) => {
    try {
      const response = await searchService.getRecommendations(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Basic Search
      .addCase(basicSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(basicSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(basicSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Advanced Search
      .addCase(advancedSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(advancedSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(advancedSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Recommendations
      .addCase(getRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload.data;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResults } = searchSlice.actions;
export default searchSlice.reducer;
