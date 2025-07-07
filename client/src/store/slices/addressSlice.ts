import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = 'http://localhost:8000/api/addresses';

// GET /addresses?userId=xxx
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}?userId=${userId}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// GET /addresses/:id
export const fetchAddressById = createAsyncThunk(
  'addresses/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// POST /addresses
export const createAddress = createAsyncThunk(
  'addresses/create',
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(BASE_URL, addressData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

// PUT /addresses/:id
export const updateAddress = createAsyncThunk(
  'addresses/update',
  async (
    { id, updateData }: { id: string; updateData: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.put(`${BASE_URL}/${id}`, updateData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// DELETE /addresses/:id
export const deleteAddress = createAsyncThunk(
  'addresses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// Slice
const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    loading: false,
    error: null as string | null,
    addresses: [] as any[],
    currentAddress: null as any
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch all
      .addCase(fetchAddresses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.currentAddress = action.payload;
      })

      // Create
      .addCase(createAddress.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.unshift(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(
          addr => addr._id === action.payload._id
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        if (state.currentAddress?._id === action.payload._id) {
          state.currentAddress = action.payload;
        }
      })

      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(
          addr => addr._id !== action.payload
        );
      });
  }
});

export default addressSlice.reducer;
