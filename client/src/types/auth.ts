import type { LoginFormFields } from './login';
import type { RegisterFormFields } from './register';
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
  login: (data: LoginFormFields) => Promise<void>;

  // Change name to signUp because register is a keyword in react-hook-form
  signUp: (data: RegisterFormFields) => Promise<void>;
};
