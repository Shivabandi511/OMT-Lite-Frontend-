import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMfaInit: (email: string, password: string) => Promise<{ mfaRequired: boolean; email: string; message: string; debugOtp?: string }>;
  loginMfaVerify: (email: string, otp: string) => Promise<void>;
  sendForgotPasswordOtp: (email: string) => Promise<{ email: string; message: string; debugOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  canMakeOperations: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omt_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('omt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('omt_token');
      if (savedToken) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
          localStorage.setItem('omt_user', JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('omt_token', jwtToken);
    localStorage.setItem('omt_user', JSON.stringify(userData));
  };

  const loginMfaInit = async (email: string, password: string) => {
    const res = await api.post<{ mfaRequired: boolean; email: string; message: string; debugOtp?: string }>('/auth/login-mfa-init', {
      email,
      password,
    });
    return res.data;
  };

  const loginMfaVerify = async (email: string, otp: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login-mfa-verify', {
      email,
      otp,
    });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('omt_token', jwtToken);
    localStorage.setItem('omt_user', JSON.stringify(userData));
  };

  const sendForgotPasswordOtp = async (email: string) => {
    const res = await api.post<{ email: string; message: string; debugOtp?: string }>('/auth/forgot-password', {
      email,
    });
    return res.data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await api.post<{ valid: boolean }>('/auth/verify-otp', {
      email,
      otp,
    });
    return res.data.valid;
  };

  const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string) => {
    const res = await api.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return res.data.message;
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('omt_token');
    localStorage.removeItem('omt_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginMfaInit,
        loginMfaVerify,
        sendForgotPasswordOtp,
        verifyOtp,
        resetPasswordWithOtp,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        isStaff: user?.role === 'STAFF',
        canMakeOperations: user?.role === 'ADMIN' || (user?.canMakeOperations ?? true),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
