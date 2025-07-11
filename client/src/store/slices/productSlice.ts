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

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (newProduct, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/products', newProduct);
      return res.data.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

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

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    await axios.delete(`/api/products/${id}`);
    return id;
  }
);

export const fetchProductsByShop = createAsyncThunk(
  'products/fetchByShop',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/shop/${shopId}`);
      return {
        products: res.data.data,
        shop: res.data.shop
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Lỗi khi lấy sản phẩm theo shop'
      );
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
      category?: string;
      status?: string;
      province?: string;
      ward?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Truyền limit lớn để lấy toàn bộ sản phẩm
      const res = await axios.get('/api/products/filter', {
        params: { ...params, limit: params.limit || 100000 }
      });
      return res.data.data;
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
  shopProducts: [],
  shopInfo: null,
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
        state.shopProducts.push(action.payload);
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
        const updateInArray = (arr: any[]) => {
          const index = arr.findIndex(item => item._id === action.payload._id);
          if (index !== -1) arr[index] = action.payload;
        };
        updateInArray(state.items);
        updateInArray(state.shopProducts);
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
        state.shopProducts = state.shopProducts.filter(
          item => item._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || null;
      })

      // Filter products
      .addCase(filterProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Xử lý mọi kiểu trả về từ backend
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload.result?.docs) {
          state.items = action.payload.result.docs;
        } else if (action.payload.docs) {
          state.items = action.payload.docs;
        } else {
          state.items = [];
        }
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
        state.shopProducts = Array.isArray(action.payload.products)
          ? action.payload.products
          : [];
        state.shopInfo = action.payload.shop || null;
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
