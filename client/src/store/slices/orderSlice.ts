import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/orders';

// Get all orders (pagination + filters)
export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${BASE_URL}?${query}`);
      return res.data.data.result;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// Get single order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// Create new order
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}`, orderData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

// Slice Definition
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    loading: false,
    error: null,
    orders: [],
    pagination: {},
    currentOrder: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch All order
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.docs || [];
        state.pagination = {
          total: action.payload.totalDocs,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch One order
      .addCase(fetchOrderById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create new order
      .addCase(createOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default orderSlice.reducer;
