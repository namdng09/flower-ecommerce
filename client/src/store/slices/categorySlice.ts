import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thêm createCategory
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, thunkAPI) => {
    try {
      const response = await axios.post('http://localhost:8000/api/categories', categoryData);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thêm updateCategory
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, updatedData }: { id: string; updatedData: any }, thunkAPI) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/categories/${id}`, updatedData);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    resetCategories(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Xử lý createCategory
      .addCase(createCategory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Xử lý updateCategory
      .addCase(updateCategory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((cat: any) => cat._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetCategories } = categorySlice.actions;
export default categorySlice.reducer;