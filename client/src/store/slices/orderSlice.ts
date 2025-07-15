import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';

export type OrderStatus =
  | 'pending'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'unpaid'
  | 'paid'
  | 'expired'
  | 'refunded';

export type ShipmentStatus =
  | 'pending'
  | 'picking_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export interface IOrderItem {
  variant: string;
  quantity: number;
  price: number;
}

export interface IPayment {
  amount: number;
  method: 'cod' | 'banking';
  status: PaymentStatus;
  description?: string;
  paymentDate?: string;
  gatewayRef?: string;
}

export interface IShipment {
  carrier?: string;
  trackingNumber?: string;
  shippingCost: number;
  status: ShipmentStatus;
  deliveredAt?: string;
  returnReason?: string;
}

export interface ICustomization {
  giftMessage?: string;
  isAnonymous?: boolean;
  deliveryTimeRequested?: string;
  notes?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  shop: string;
  user: string;
  address: string;
  items: IOrderItem[];
  totalQuantity: number;
  totalPrice: number;
  status: OrderStatus;
  payment: IPayment;
  shipment: IShipment;
  customization?: ICustomization;
  description?: string;
  expectedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  orderNumber?: string;
  shop?: string;
  user?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface OrderState {
  orders: IOrder[];
  currentOrder: IOrder | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: OrderFilterParams;
  userOrders: IOrder[];
  shopOrders: IOrder[];
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  },
  filters: {
    page: 1,
    limit: 10,
    status: '',
    orderNumber: '',
    shop: '',
    user: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  userOrders: [],
  shopOrders: []
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: OrderFilterParams = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '')
          queryParams.append(key, String(value));
      });
      const res = await axios.get(
        `/api/orders/filter?${queryParams.toString()}`
      );
      return { data: res.data.data.result, filters: params };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch order'
      );
    }
  }
);

export const fetchOrdersByUser = createAsyncThunk(
  'orders/fetchOrdersByUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/${userId}/user`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch user orders'
      );
    }
  }
);

export const fetchOrdersByShop = createAsyncThunk(
  'orders/fetchOrdersByShop',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/${shopId}/shop`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch shop orders'
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: Partial<IOrder>, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/orders', orderData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (
    { id, updateData }: { id: string; updateData: Partial<IOrder> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(`/api/orders/${id}`, updateData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update order'
      );
    }
  }
);

export const updateShipment = createAsyncThunk(
  'orders/updateShipment',
  async (
    { id, shipmentData }: { id: string; shipmentData: IShipment },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(`/api/orders/${id}/shipment`, shipmentData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update shipment'
      );
    }
  }
);

export const updatePayment = createAsyncThunk(
  'orders/updatePayment',
  async (
    { id, paymentData }: { id: string; paymentData: IPayment },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(`/api/orders/${id}/payment`, paymentData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update payment'
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete order'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentOrder: state => {
      state.currentOrder = null;
    },
    clearError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.docs || [];
        state.pagination = {
          totalDocs: action.payload.data.totalDocs || 0,
          limit: action.payload.data.limit || 10,
          page: action.payload.data.page || 1,
          totalPages: action.payload.data.totalPages || 1,
          pagingCounter: action.payload.data.pagingCounter || 1,
          hasPrevPage: action.payload.data.hasPrevPage || false,
          hasNextPage: action.payload.data.hasNextPage || false,
          prevPage: action.payload.data.prevPage || null,
          nextPage: action.payload.data.nextPage || null
        };
        state.filters = { ...state.filters, ...action.payload.filters };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch order by ID
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
        state.error = action.payload as string;
      })

      // Fetch orders by user
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
        state.error = action.payload as string;
      })

      // Fetch orders by shop
      .addCase(fetchOrdersByShop.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByShop.fulfilled, (state, action) => {
        state.loading = false;
        state.shopOrders = action.payload;
      })
      .addCase(fetchOrdersByShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create order
      .addCase(createOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(createOrder.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.orders.unshift(action.payload);
      // })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })

      // Update shipment
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })

      // Update payment
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })

      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          order => order._id !== action.payload
        );
      });
  }
});

export const { setFilters, clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
