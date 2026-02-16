import { apiService } from './api';
import { LoginRequest, RegisterRequest, User } from '../types';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user?: User;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<User> {
    const response = await apiService.post<LoginResponse>('/v1/api/auth/login', credentials);

    if (response.success && response.data) {
      // Store access token immediately and synchronously
      const accessToken = response.data.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        // Verify token was stored
        const storedToken = localStorage.getItem('accessToken');
        if (!storedToken || storedToken !== accessToken) {
          logger.error('Failed to store access token');
          throw AppError.auth('Failed to store access token');
        }
        logger.info('User logged in successfully', { email: response.data.user?.email });
      }
      return response.data.user;
    }

    throw AppError.fromApiResponse(response, 'Login failed');
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiService.post<RegisterResponse>('/v1/api/auth/register', userData);

    if (!response.success) {
      throw AppError.fromApiResponse(response, 'Registration failed');
    }

    logger.info('User registered successfully');
    return response.data || { message: 'Registration successful' };
  }

  static async logout(): Promise<void> {
    try {
      await apiService.post<void>('/v1/api/auth/logout');
    } catch (error) {
      logger.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      logger.info('User logged out');
    }
  }

  static async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/v1/api/auth/profile');

    if (response.success && response.data) {
      return response.data;
    }

    throw AppError.fromApiResponse(response, 'Failed to get profile');
  }

  static async forgotPassword(email: string): Promise<string> {
    const response = await apiService.post<{ message: string }>('/v1/api/auth/forgot-password', {
      email,
    });

    if (!response.success) {
      throw AppError.fromApiResponse(response, 'Failed to send reset email');
    }

    logger.info('Password reset email sent', { email });
    return response.message || 'Password reset email sent';
  }

  static async resetPassword(token: string, password: string): Promise<string> {
    const response = await apiService.post<{ message: string }>('/v1/api/auth/reset-password', {
      token,
      password,
    });

    if (!response.success) {
      throw AppError.fromApiResponse(response, 'Failed to reset password');
    }

    logger.info('Password reset successful');
    return response.message || 'Password reset successful';
  }

  static async verifyEmail(token: string): Promise<string> {
    // Properly encode the token for URL
    const encodedToken = encodeURIComponent(token);
    const response = await apiService.get<{ message: string }>(
      `/v1/api/auth/verify-email?token=${encodedToken}`
    );

    if (!response.success) {
      throw AppError.fromApiResponse(response, 'Failed to verify email');
    }

    logger.info('Email verified successfully');
    return response.message || 'Email verified successfully';
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  static getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
