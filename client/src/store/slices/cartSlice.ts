import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = '/api/carts'; // Đã dùng axiosInstance, không cần domain

// ✅ Thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    {
      userId,
      variantId,
      quantity
    }: { userId: string; variantId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(`${BASE_URL}/${userId}/items`, {
        variantId,
        quantity
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    {
      userId,
      variantId,
      quantity
    }: { userId: string; variantId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.put(`${BASE_URL}/${userId}/items`, {
        variantId,
        quantity
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (
    { userId, variantId }: { userId: string; variantId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${userId}/items`, {
        data: { variantId }
      });
      return variantId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [] as Array<{ variantId: string; quantity: number }>,
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Thêm sản phẩm
      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const existing = state.items.find(
          item => item.variantId === action.payload.variantId
        );
        if (existing) {
          existing.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cập nhật sản phẩm
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const item = state.items.find(
          i => i.variantId === action.payload.variantId
        );
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Xóa sản phẩm
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(
          item => item.variantId !== action.payload
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export default cartSlice.reducer;
