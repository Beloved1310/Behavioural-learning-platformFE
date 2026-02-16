import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/authService';
import { apiService } from '@/services/api';
import { AppError } from '@/utils/errors';
import { UserRole } from '@/types';

// Mock apiService
vi.mock('@/services/api', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
      };

      const mockResponse = {
        success: true,
        data: {
          accessToken: 'test-token',
          user: mockUser,
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(localStorage.getItem('accessToken')).toBe('test-token');
      expect(apiService.post).toHaveBeenCalledWith('/v1/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error when login fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow();

      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should throw error when token storage fails', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'test-token',
          user: { id: '123', email: 'test@example.com' },
        },
      };

      // Mock localStorage to fail
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage failed');
      });

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Registration successful',
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
      });

      expect(result.message).toBe('Registration successful');
      expect(apiService.post).toHaveBeenCalledWith('/v1/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
      });
    });

    it('should throw error when registration fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Email already exists',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.STUDENT,
        })
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      localStorage.setItem('accessToken', 'test-token');

      const mockResponse = {
        success: true,
        message: 'Logged out',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await AuthService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(apiService.post).toHaveBeenCalledWith('/v1/api/auth/logout');
    });

    it('should clear token even if logout API fails', async () => {
      localStorage.setItem('accessToken', 'test-token');

      vi.mocked(apiService.post).mockRejectedValue(new Error('Network error'));

      await AuthService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
      };

      const mockResponse = {
        success: true,
        data: mockUser,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const result = await AuthService.getProfile();

      expect(result).toEqual(mockUser);
      expect(apiService.get).toHaveBeenCalledWith('/v1/api/auth/profile');
    });

    it('should throw error when profile fetch fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Unauthorized',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      await expect(AuthService.getProfile()).rejects.toThrow();
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.forgotPassword('test@example.com');

      expect(result).toBe('Password reset email sent');
      expect(apiService.post).toHaveBeenCalledWith('/v1/api/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('should throw error when forgot password fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Email not found',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await expect(AuthService.forgotPassword('test@example.com')).rejects.toThrow();
    });

    it('should return default message when message is not provided', async () => {
      const mockResponse = {
        success: true,
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.forgotPassword('test@example.com');

      expect(result).toBe('Password reset email sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset successful',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.resetPassword('token123', 'newpassword123');

      expect(result).toBe('Password reset successful');
      expect(apiService.post).toHaveBeenCalledWith('/v1/api/auth/reset-password', {
        token: 'token123',
        password: 'newpassword123',
      });
    });

    it('should throw error when reset password fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid token',
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      await expect(AuthService.resetPassword('invalid-token', 'newpassword')).rejects.toThrow();
    });

    it('should return default message when message is not provided', async () => {
      const mockResponse = {
        success: true,
      };

      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await AuthService.resetPassword('token123', 'newpassword123');

      expect(result).toBe('Password reset successful');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Email verified successfully',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const result = await AuthService.verifyEmail('token123');

      expect(result).toBe('Email verified successfully');
      expect(apiService.get).toHaveBeenCalledWith('/v1/api/auth/verify-email?token=token123');
    });

    it('should encode token in URL', async () => {
      const mockResponse = {
        success: true,
        message: 'Email verified',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      await AuthService.verifyEmail('token with spaces');

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('token with spaces'))
      );
    });

    it('should throw error when email verification fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid token',
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      await expect(AuthService.verifyEmail('invalid-token')).rejects.toThrow();
    });
  });
});

