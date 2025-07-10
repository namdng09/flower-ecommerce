import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = 'http://localhost:8000/api/favourites';

// GET /favourites/:userId
export const fetchFavouritesByUser = createAsyncThunk(
  'favourites/fetchByUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${userId}`);
      return res.data.data.products; // Chỉ trả về mảng productId
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// POST /favourites/:userId/items { productId }
export const addFavouriteItem = createAsyncThunk(
  'favourites/addItem',
  async (
    { userId, productId }: { userId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(`${BASE_URL}/${userId}/items`, {
        productId
      });
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Add failed');
    }
  }
);

// DELETE /favourites/:userId/items
export const removeFavouriteItem = createAsyncThunk(
  'favourites/removeItem',
  async (
    { userId, productId }: { userId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(`/api/favourites/${userId}/items`, {
        data: { productId }
      });
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Remove failed');
    }
  }
);

// Slice
const favouriteSlice = createSlice({
  name: 'favourites',
  initialState: {
    loading: false,
    error: null as string | null,
    items: [] as string[]
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavouritesByUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavouritesByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavouritesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addFavouriteItem.fulfilled, (state, action) => {
        if (!state.items.includes(action.payload)) {
          state.items.push(action.payload);
        }
      })

      .addCase(removeFavouriteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(id => id !== action.payload);
      });
  }
});

export default favouriteSlice.reducer;
