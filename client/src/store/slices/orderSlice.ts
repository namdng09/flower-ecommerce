import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/orders';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${BASE_URL}?${query}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

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

export const fetchOrdersByUser = createAsyncThunk(
  'orders/fetchByUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${userId}/user`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

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

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${id}`, updateData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const updateShipment = createAsyncThunk(
  'orders/updateShipment',
  async ({ id, shipmentData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${id}/shipment`, shipmentData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Update shipment failed'
      );
    }
  }
);

export const updatePayment = createAsyncThunk(
  'orders/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BASE_URL}/${id}/payment`, paymentData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Update payment failed'
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    loading: false,
    error: null,
    orders: [],
    pagination: {},
    currentOrder: null,
    userOrders: []
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        state.pagination = {
          total: action.payload.length,
          page: 1,
          limit: action.payload.length,
          totalPages: 1
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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

      .addCase(fetchOrdersByUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })

      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          order => order._id !== action.payload
        );
      });
  }
});

export default orderSlice.reducer;
