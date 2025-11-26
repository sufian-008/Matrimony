import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';

const initialState = {
  profile: null,
  viewedProfile: null,
  isLoading: false,
  error: null,
};

export const createProfile = createAsyncThunk(
  'profile/create',
  async (profileData, thunkAPI) => {
    try {
      const response = await profileService.createProfile(profileData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getMyProfile = createAsyncThunk(
  'profile/getMyProfile',
  async (_, thunkAPI) => {
    try {
      const response = await profileService.getMyProfile();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (profileData, thunkAPI) => {
    try {
      const response = await profileService.updateProfile(profileData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getProfileById = createAsyncThunk(
  'profile/getById',
  async (profileId, thunkAPI) => {
    try {
      const response = await profileService.getProfileById(profileId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (formData, thunkAPI) => {
    try {
      const response = await profileService.uploadPhoto(formData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Profile
      .addCase(createProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get My Profile
      .addCase(getMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Profile By ID
      .addCase(getProfileById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedProfile = action.payload.data;
      })
      .addCase(getProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Photo
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.photos = action.payload.data.photos;
        }
      });
  },
});

export const { clearError, clearViewedProfile } = profileSlice.actions;
export default profileSlice.reducer;
