import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = '/api/carts';

export const fetchCartByUserId = createAsyncThunk(
  'cart/fetchCartByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${userId}`);
      return res.data.data.items;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [] as Array<{
      variantId: {
        _id: string;
        title: string;
        variantCode: string;
        image: string;
        salePrice: number;
        listPrice: number;
      };
      quantity: number;
    }>,
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCartByUserId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const existing = state.items.find(
          item => item.variantId._id === action.payload.variantId._id
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

      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { variantId, quantity } = action.payload;
        const item = state.items.find(i => i.variantId._id === variantId);
        if (item) {
          item.quantity = quantity;
        }
      })

      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(
          item => item.variantId._id !== action.payload
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export default cartSlice.reducer;
