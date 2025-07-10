import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const res = await axios.get('/api/products');
    return res.data.data;
  }
);

// Create a new product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (newProduct, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/products', newProduct);
      return res.data.data;
    } catch (err: any) {
      // Trả về lỗi chi tiết từ backend nếu có
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

// Update a product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/products/${id}`, updatedData);
      return res.data.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    await axios.delete(`/api/products/${id}`);
    return id; // PHẢI return id, không phải response.data
  }
);

// Fetch products by userId (role shop)
export const fetchProductsByShop = createAsyncThunk(
  'products/fetchProductsByShop',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/shop/${userId}`);
      return res.data.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const filterProducts = createAsyncThunk(
  'products/filterProducts',
  async (
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
      title?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.get('/api/products/filter', { params });
      return res.data.data; // giả sử backend trả về { data: [...] }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null as string | null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch all
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })

      // Create
      .addCase(createProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      })

      // Update
      .addCase(updateProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      })

      // Delete
      .addCase(deleteProduct.pending, state => {
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      })

      .addCase(filterProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(filterProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      })

      // Fetch products by shop (userId)
      .addCase(fetchProductsByShop.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByShop.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsByShop.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      });
  }
});

export default productSlice.reducer;
