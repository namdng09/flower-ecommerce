import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/config/axiosConfig';
import type { UserFormData } from '~/types/userSchema';

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'customer' | 'shop';
  avatarUrl?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalUsers: number;
  filters: UserFilterParams;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  totalUsers: 0,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// Fetch users with filtering and pagination
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UserFilterParams = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const res = await axios.get(`/api/users/filter?${queryParams.toString()}`);
    return { data: res.data.data.result, filters: params };
  }
);

// Fetch single user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string) => {
    const res = await axios.get(`/api/users/${id}`);
    return res.data.data;
  }
);

// Create new user
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserFormData) => {
    const res = await axios.post('/api/users', userData);
    return res.data.data;
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: UserFormData }) => {
    const res = await axios.put(`/api/users/${id}`, userData);
    return res.data.data;
  }
);

// Update user avatar
export const updateUserAvatar = createAsyncThunk(
  'users/updateUserAvatar',
  async ({ id, avatarUrl }: { id: string; avatarUrl: string }) => {
    const res = await axios.patch(`/api/users/${id}/avatar`, { avatarUrl });
    return res.data.data;
  }
);

// Update user cover
export const updateUserCover = createAsyncThunk(
  'users/updateUserCover',
  async ({ id, coverUrl }: { id: string; coverUrl: string }) => {
    const res = await axios.patch(`/api/users/${id}/cover`, { coverUrl });
    return res.data.data;
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    const res = await axios.delete(`/api/users/${id}`);
    return { id, message: res.data.message };
  }
);

// Update user password
export const updateUserPassword = createAsyncThunk(
  'users/updateUserPassword',
  async ({
    email,
    oldPassword,
    newPassword
  }: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    const res = await axios.patch(`/api/users/${email}`, {
      oldPassword,
      newPassword
    });
    return res.data;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentUser: state => {
      state.currentUser = null;
    },
    clearError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data.docs || [];
        state.totalPages = action.payload.data.totalPages || 0;
        state.currentPage = action.payload.data.page || 1;
        state.totalUsers = action.payload.data.totalDocs || 0;
        state.filters = { ...state.filters, ...action.payload.filters };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })

      // Create user
      .addCase(createUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.totalUsers += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      })

      // Update user
      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          user => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      })

      // Update avatar
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          user => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })

      // Update cover
      .addCase(updateUserCover.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          user => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })

      // Delete user
      .addCase(deleteUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          user => user._id !== action.payload.id
        );
        state.totalUsers -= 1;
        if (state.currentUser && state.currentUser._id === action.payload.id) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete user';
      })

      // Update password
      .addCase(updateUserPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update password';
      });
  }
});

export const { setFilters, clearCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer;
