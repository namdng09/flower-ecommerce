import type { User } from './user';

export type Auth = {
  accessToken: string;
  setAccessToken: (token: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isTokenExpired: (token: string) => boolean;
  refreshToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
};
