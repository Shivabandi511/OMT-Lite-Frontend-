import api from './api';
import type { User } from '../types';

export const authService = {
  /**
   * Direct password login
   */
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  /**
   * Update profile details (e.g. name)
   */
  async updateProfile(name: string): Promise<User> {
    const res = await api.put<User>('/auth/profile', { name });
    return res.data;
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  /**
   * Initialize MFA login flow
   */
  async loginMfaInit(email: string, password: string): Promise<{
    mfaRequired: boolean;
    email: string;
    message: string;
    debugOtp?: string;
  }> {
    const res = await api.post('/auth/login-mfa-init', { email, password });
    return res.data;
  },

  /**
   * Verify MFA OTP during login
   */
  async loginMfaVerify(email: string, otp: string): Promise<{ token: string; user: User }> {
    const res = await api.post<{ token: string; user: User }>('/auth/login-mfa-verify', { email, otp });
    return res.data;
  },

  /**
   * Send forgot password OTP
   */
  async sendForgotPasswordOtp(email: string): Promise<{ email: string; message: string; debugOtp?: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  /**
   * Verify forgot password OTP
   */
  async verifyOtp(email: string, otp: string): Promise<{ valid: boolean }> {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  /**
   * Reset password with verified OTP
   */
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },
};

export default authService;
