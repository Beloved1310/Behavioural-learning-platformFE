import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/index';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://behavioural-learning-platformbe-1.onrender.com',
      timeout: 30000, // Increased to 30 seconds for complex queries
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Always get the latest token from localStorage for each request
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          logger.api(
            config.method?.toUpperCase() || 'GET',
            config.url || '',
            undefined,
            undefined,
            {
              hasToken: true,
            }
          );
        } else {
          // Remove Authorization header if no token exists
          delete config.headers.Authorization;

          // List of public endpoints that don't require authentication
          const publicEndpoints = [
            '/auth/login',
            '/auth/register',
            '/auth/verify-email',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/resend-verification',
          ];

          // Only log warnings for protected endpoints that require auth
          const isPublicEndpoint =
            config.url && publicEndpoints.some((endpoint) => config.url!.includes(endpoint));

          if (!isPublicEndpoint) {
            logger.warn('Request to protected endpoint without token', {
              url: config.url,
              method: config.method,
            });
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // Skip retry for refresh endpoint and login endpoint to avoid infinite loops
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
        const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');
        const isPublicEndpoint =
          isRefreshEndpoint ||
          isLoginEndpoint ||
          originalRequest?.url?.includes('/auth/register') ||
          originalRequest?.url?.includes('/auth/verify-email') ||
          originalRequest?.url?.includes('/auth/forgot-password') ||
          originalRequest?.url?.includes('/auth/reset-password');

        // Handle authentication errors
        if (this.isAuthError(error) && !isPublicEndpoint) {
          const hasAccessToken = localStorage.getItem('accessToken');

          // If we have a token and it's a 401, try to refresh it first
          if (error.response?.status === 401 && hasAccessToken && !originalRequest?._retry) {
            originalRequest._retry = true;

            try {
              const response = await this.api.post<ApiResponse<{ accessToken: string }>>(
                '/v1/api/auth/refresh',
                {},
                {
                  skipAuthRefresh: true, // Flag to prevent retry on this request
                }
              );
              const accessToken = response.data.data?.accessToken;

              if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                if (originalRequest?.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return this.api(originalRequest!);
              }
            } catch (refreshError) {
              // Refresh failed, sign out and redirect
              this.handleAuthError();
              return Promise.reject(this.handleError(error));
            }
          } else {
            // No token, invalid token, or refresh failed - sign out and redirect
            this.handleAuthError();
            return Promise.reject(this.handleError(error));
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if error is an authentication error
   */
  private isAuthError(error: AxiosError<ApiResponse>): boolean {
    const status = error.response?.status;

    // 401 is always an auth error
    if (status === 401) {
      return true;
    }

    // 403 might be auth error OR permission error - check the message
    if (status === 403) {
      const errorMessage = (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        ''
      ).toLowerCase();

      // Only treat as auth error if it's explicitly about authentication
      const authKeywords = [
        'authentication required',
        'no token provided',
        'invalid token',
        'token expired',
        'please log in',
        'please log in again',
        'user not found',
        'please verify your email',
      ];

      // Permission errors (like "Only tutors can approve") should NOT trigger auth redirect
      const permissionKeywords = [
        'only tutors',
        'only students',
        'only admins',
        'insufficient permissions',
        'you can only',
        'access denied',
      ];

      // If it's a permission error, don't treat as auth error
      if (permissionKeywords.some((keyword) => errorMessage.includes(keyword))) {
        return false;
      }

      // Otherwise, check if it's an auth-related error
      return authKeywords.some((keyword) => errorMessage.includes(keyword));
    }

    // Check error message for authentication-related keywords
    const errorMessage = (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      ''
    ).toLowerCase();

    const authKeywords = [
      'authentication required',
      'no token provided',
      'invalid token',
      'token expired',
      'please log in',
      'please log in again',
      'user not found',
      'please verify your email',
    ];

    return authKeywords.some((keyword) => errorMessage.includes(keyword));
  }

  /**
   * Handle authentication error by signing out and redirecting to login
   */
  private handleAuthError(): void {
    // Clear all auth-related data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth-storage');
    sessionStorage.clear();

    // Clear auth store by clearing persisted state
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        parsed.state = {
          ...parsed.state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        };
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    } catch (e) {
      // If we can't parse, just remove it
      localStorage.removeItem('auth-storage');
    }

    // Redirect to login if not already there
    const currentPath = window.location.pathname;
    const publicPaths = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
    ];

    if (!publicPaths.some((path) => currentPath.startsWith(path))) {
      // Store the current path to redirect back after login
      const returnUrl = currentPath !== '/' ? currentPath : null;
      if (returnUrl) {
        sessionStorage.setItem('returnUrl', returnUrl);
      }

      window.location.href = '/login';
    }
  }

  private handleError(error: AxiosError<ApiResponse>): AppError {
    // Note: Auth error handling is done in the interceptor to avoid duplicate calls
    // This method formats the error as an AppError

    if (error.response?.data) {
      const apiError = error.response.data;
      return AppError.fromApiResponse(
        {
          error: apiError.error || apiError.message || 'An error occurred',
          code: apiError.code,
          statusCode: error.response.status,
          details: apiError.details,
        },
        'An error occurred'
      );
    }

    if (error.request) {
      return AppError.network('No response from server. Please check your connection.');
    }

    return new AppError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR');
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url);
      const duration = Math.round(performance.now() - startTime);
      logger.api('GET', url, response.status, duration);
      return response.data;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const statusCode = (error as AxiosError)?.response?.status;
      logger.api('GET', url, statusCode, duration, { error: true });
      throw error;
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data, config);
      const duration = Math.round(performance.now() - startTime);
      logger.api('POST', url, response.status, duration);
      return response.data;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const statusCode = (error as AxiosError)?.response?.status;
      logger.api('POST', url, statusCode, duration, { error: true });
      throw error;
    }
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
      const duration = Math.round(performance.now() - startTime);
      logger.api('PUT', url, response.status, duration);
      return response.data;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const statusCode = (error as AxiosError)?.response?.status;
      logger.api('PUT', url, statusCode, duration, { error: true });
      throw error;
    }
  }

  async delete<T>(url: string, config?: Record<string, any>): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url, config);
      const duration = Math.round(performance.now() - startTime);
      logger.api('DELETE', url, response.status, duration);
      return response.data;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const statusCode = (error as AxiosError)?.response?.status;
      logger.api('DELETE', url, statusCode, duration, { error: true });
      throw error;
    }
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data);
      const duration = Math.round(performance.now() - startTime);
      logger.api('PATCH', url, response.status, duration);
      return response.data;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const statusCode = (error as AxiosError)?.response?.status;
      logger.api('PATCH', url, statusCode, duration, { error: true });
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
