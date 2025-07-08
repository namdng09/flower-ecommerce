import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const res = await axios.get('/api/products');
    return res.data.data;
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

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], // all products
    shopProducts: [], // sản phẩm theo shop
    shopInfo: null,
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: builder => {
    builder
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
        state.error = action.error.message || 'Lỗi khi tải sản phẩm';
      })

      .addCase(fetchProductsByShop.pending, state => {
        state.loading = true;
        state.error = null;
        state.shopProducts = [];
        state.shopInfo = null;
      })
      .addCase(fetchProductsByShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shopProducts = action.payload.products;
        state.shopInfo = action.payload.shop;
      })
      .addCase(fetchProductsByShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default productSlice.reducer;
