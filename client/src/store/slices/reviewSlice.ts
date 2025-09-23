import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/reviews`;

export const fetchReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axiosInstance.get(`${BASE_URL}?${query}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  'reviews/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

export const fetchReviewByProductId = createAsyncThunk(
  'reviews/fetchByProductId',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/product/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`${BASE_URL}`, reviewData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async (
    { id, updateData }: { id: string; updateData: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.patch(`${BASE_URL}/${id}`, updateData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// Slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    loading: false,
    error: null as string | null,
    reviews: [] as any[],
    pagination: {},
    currentReview: null as any
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReviews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload || [];
        state.pagination = {
          total: action.payload.length,
          page: 1,
          limit: action.payload.length,
          totalPages: 1
        };
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchReviewById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchReviewByProductId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload;
      })
      .addCase(fetchReviewByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createReview.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.currentReview = action.payload;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateReview.fulfilled, (state, action) => {
        state.currentReview = action.payload;
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          review => review._id !== action.payload
        );
      });
  }
});

export default reviewSlice.reducer;
