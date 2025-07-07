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

export interface UserFormData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'customer' | 'shop';
}

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
