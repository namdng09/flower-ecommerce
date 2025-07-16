import { createContext, useState, useEffect } from 'react';
import type { Auth } from '../types/auth';
import type { User } from '../types/user';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../config/axiosConfig';
import type { RegisterFormFields } from '~/types/register';
import type { LoginFormFields } from '~/types/login';
import { error } from 'console';

const initialAuthToken: Auth = {
  accessToken: '',
  setAccessToken: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  loading: false,
  setLoading: () => {},
  isTokenExpired: () => true,
  refreshToken: async () => null,
  logout: async () => {},
  login: async () => {},
  signUp: async () => {}
};

export const AuthContext = createContext<Auth>(initialAuthToken);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTimeInSecond = Date.now() / 1000;
      return decodedToken.exp
        ? decodedToken.exp < currentTimeInSecond + 30
        : true;
    } catch {
      return true;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axiosInstance.post('/api/auth/refresh-token');
      const newToken = response.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      setAccessToken(newToken);
      setIsAuthenticated(true);
      setUser(jwtDecode<User>(newToken));
      return newToken;
    } catch {
      logout();
      return null;
    }
  };

  const login = async (data: LoginFormFields) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', data);
      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      setUser(jwtDecode<User>(accessToken));
    } catch {
      throw new Error('Login failed');
    }
  };

  const signUp = async (data: RegisterFormFields) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', data);
      if (response.data.status == 'failed') {
        throw new Error(response.data.message);
      }
      const { accessToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      setUser(jwtDecode<User>(accessToken));
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken('');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    try {
      await axiosInstance.post(
        '/api/auth/logout',
        {},
        { withCredentials: true }
      );
    } catch {
      console.error('Logout failed');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Ưu tiên lấy accessToken từ localStorage (Google login sẽ lưu ở đây)
      const savedToken =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      if (isTokenExpired(savedToken)) {
        const newToken = await refreshToken();
        if (!newToken) {
          setLoading(false);
          return;
        }
      } else {
        setAccessToken(savedToken);
        setIsAuthenticated(true);
        setUser(jwtDecode<User>(savedToken));
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading,
        setLoading,
        isTokenExpired,
        refreshToken,
        logout,
        login,
        signUp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
