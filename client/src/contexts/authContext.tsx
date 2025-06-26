import { createContext, useState, useEffect } from 'react';
import type { Auth } from '../types/auth';
import type { User } from '../types/user';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../config/axiosConfig';
import type { RegisterFormFields } from '~/types/register';
import type { LoginFormFields } from '~/types/login';

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

  // Set loading state to true initially
  // Because we need to wait for the auth initialization
  const [loading, setLoading] = useState<boolean>(true);

  const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTimeInSecond = Date.now() / 1000;
      return decodedToken.exp
        ? decodedToken.exp < currentTimeInSecond + 30
        : true; // 30 seconds buffer
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axiosInstance.post('/api/auth/refresh-token');
      const newToken = response.data.accessToken;

      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', newToken);
      } else {
        sessionStorage.setItem('accessToken', newToken);
      }

      setAccessToken(newToken);
      setIsAuthenticated(true);
      const decodedUser = jwtDecode<User>(newToken);
      setUser(decodedUser);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  };

  const login = async (data: LoginFormFields) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', data);
      const { accessToken } = response.data.data;

      if (data.rememberMe) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
      }

      setAccessToken(accessToken);
      setIsAuthenticated(true);
      const decodedUser = jwtDecode<User>(accessToken);
      setUser(decodedUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const signUp = async (data: RegisterFormFields) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', data);
      const { accessToken } = response.data.data;

      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
      }

      setAccessToken(accessToken);
      setIsAuthenticated(true);
      const decodedUser = jwtDecode<User>(accessToken);
      setUser(decodedUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
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
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
      try {
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
          const decodedUser = jwtDecode<User>(savedToken);
          setUser(decodedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
