import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';

export const fetchVariants = createAsyncThunk(
  'variants/fetchVariants',
  async () => {
    const res = await axios.get('/api/variants');
    return res.data.data;
  }
);

const variantSlice = createSlice({
  name: 'variants',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchVariants.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVariants.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default variantSlice.reducer;
