import { apiService } from './api';
import { LoginRequest, RegisterRequest, User } from '../types';

export class AuthService {
  static async login(credentials: LoginRequest) {
    const response = await apiService.post('/auth/login', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data.user;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  static async register(userData: RegisterRequest) {
    const response = await apiService.post('/auth/register', userData);
    
    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
    
    return response.data;
  }

  static async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  }

  static async getProfile(): Promise<User> {
    const response = await apiService.get('/auth/profile');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get profile');
  }

  static async forgotPassword(email: string) {
    const response = await apiService.post('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }
    
    return response.message;
  }

  static async resetPassword(token: string, password: string) {
    const response = await apiService.post('/auth/reset-password', { token, password });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
    
    return response.message;
  }

  static async verifyEmail(token: string) {
    const response = await apiService.get(`/auth/verify-email?token=${token}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to verify email');
    }
    
    return response.message;
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  static getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}