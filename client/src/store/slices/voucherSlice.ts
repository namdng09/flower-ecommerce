import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '~/config/axiosConfig';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/vouchers`;

export type DiscountType = 'percentage' | 'fixed';

export const DiscountType = {
  PERCENTAGE: 'percentage' as DiscountType,
  FIXED: 'fixed' as DiscountType
};

export type DiscountStatus = 'active' | 'inactive' | 'expired';

export const DiscountStatus = {
  ACTIVE: 'active' as DiscountStatus,
  INACTIVE: 'inactive' as DiscountStatus,
  EXPIRED: 'expired' as DiscountStatus
};

export interface IVoucher {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherState {
  vouchers: IVoucher[];
  currentVoucher: IVoucher | null;
  loading: boolean;
  error: string | null;
}

const initialState: VoucherState = {
  vouchers: [],
  currentVoucher: null,
  loading: false,
  error: null
};

// GET /vouchers
export const fetchVouchers = createAsyncThunk(
  'vouchers/fetchVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(BASE_URL);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// GET /vouchers/:id
export const fetchVoucherById = createAsyncThunk(
  'vouchers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE_URL}/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

// POST /vouchers (admin only)
export const createVoucher = createAsyncThunk(
  'vouchers/create',
  async (voucherData: Partial<IVoucher>, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(BASE_URL, voucherData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Create failed');
    }
  }
);

// PUT /vouchers/:id (admin only)
export const updateVoucher = createAsyncThunk(
  'vouchers/update',
  async (
    { id, voucherData }: { id: string; voucherData: Partial<IVoucher> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.put(`${BASE_URL}/${id}`, voucherData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// DELETE /vouchers/:id (admin only)
export const deleteVoucher = createAsyncThunk(
  'vouchers/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

// Validate voucher by code (local validation)
export const validateVoucher = createAsyncThunk(
  'vouchers/validate',
  async (
    { code, orderValue }: { code: string; orderValue: number },
    { rejectWithValue, getState }
  ) => {
    try {
        const state = getState() as { voucher: VoucherState };
      const vouchers: IVoucher[] = Array.isArray(state.voucher.vouchers)
        ? state.voucher.vouchers
        : [];

      // Debug: log ra vouchers để kiểm tra
      if (!vouchers.length) {
        console.log('Voucher list is empty:', vouchers);
        return rejectWithValue('Không có dữ liệu voucher, hãy thử lại sau');
      }

      const voucher = vouchers.find(
        (v: IVoucher) => v.code === code.trim().toUpperCase()
      );

      if (!voucher) {
        return rejectWithValue('Mã voucher không tồn tại');
      }

      const now = new Date();
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);

      if (voucher.status === DiscountStatus.INACTIVE) {
        return rejectWithValue('Voucher đã bị vô hiệu hóa');
      }

      if (voucher.status === DiscountStatus.EXPIRED || now > endDate) {
        return rejectWithValue('Voucher đã hết hạn');
      }

      if (now < startDate) {
        return rejectWithValue('Voucher chưa có hiệu lực');
      }

      if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
        return rejectWithValue(
          `Đơn hàng phải đạt tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`
        );
      }

      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        return rejectWithValue('Voucher đã hết lượt sử dụng');
      }

      return voucher;
    } catch (err: any) {
      return rejectWithValue('Lỗi xác thực voucher');
    }
  }
);
// Calculate discount helper
export const calculateDiscount = (
  voucher: IVoucher,
  orderValue: number
): number => {
  if (voucher.discountType === DiscountType.PERCENTAGE) {
    return (orderValue * voucher.discountValue) / 100;
  }
  return voucher.discountValue;
};

// Slice
const voucherSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    clearCurrentVoucher: state => {
      state.currentVoucher = null;
    },
    clearError: state => {
      state.error = null;
    },
    setCurrentVoucher: (state, action) => {
      state.currentVoucher = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch all vouchers
      .addCase(fetchVouchers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchVoucherById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVoucherById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVoucher = action.payload;
      })
      .addCase(fetchVoucherById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createVoucher.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers.unshift(action.payload);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateVoucher.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vouchers.findIndex(
          v => v._id === action.payload._id
        );
        if (index !== -1) {
          state.vouchers[index] = action.payload;
        }
        if (state.currentVoucher?._id === action.payload._id) {
          state.currentVoucher = action.payload;
        }
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteVoucher.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = state.vouchers.filter(v => v._id !== action.payload);
        if (state.currentVoucher?._id === action.payload) {
          state.currentVoucher = null;
        }
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Validate
      .addCase(validateVoucher.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVoucher = action.payload;
      })
      .addCase(validateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentVoucher = null;
      });
  }
});

export const { clearCurrentVoucher, clearError, setCurrentVoucher } =
  voucherSlice.actions;

export default voucherSlice.reducer;