import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '@/__tests__/utils/testUtils';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store/authStore';

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Create MSW server
const server = setupServer();

describe('Authentication Integration Tests', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  describe('Login Flow Integration', () => {
    it('should complete full login flow with API interaction', async () => {
      const user = userEvent.setup();

      // Mock successful login API response
      server.use(
        http.post('http://localhost:3001/v1/api/auth/login', async () => {
          return HttpResponse.json(
            {
              success: true,
              data: {
                user: {
                  id: '123',
                  email: 'test@example.com',
                  firstName: 'Test',
                  lastName: 'User',
                },
                tokens: {
                  accessToken: 'mock-access-token',
                  refreshToken: 'mock-refresh-token',
                },
              },
            },
            { status: 200 }
          );
        })
      );

      // Mock store to actually call API
      mockLogin.mockImplementation(async (data) => {
        const response = await fetch('http://localhost:3001/v1/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        return result;
      });

      renderWithProviders(<LoginForm />);

      // Fill form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      // Submit
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify API was called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify token was stored
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      });
    });

    it('should handle login API error', async () => {
      const user = userEvent.setup();

      // Mock failed login API response
      server.use(
        http.post('http://localhost:3001/v1/api/auth/login', async () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Invalid email or password',
            },
            { status: 401 }
          );
        })
      );

      mockLogin.mockImplementation(async () => {
        const response = await fetch('http://localhost:3001/v1/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }
      });

      (useAuthStore as any).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid email or password',
        clearError: mockClearError,
      });

      renderWithProviders(<LoginForm />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock network error
      server.use(
        http.post('http://localhost:3001/v1/api/auth/login', async () => {
          return HttpResponse.error();
        })
      );

      mockLogin.mockRejectedValue(new Error('Network error'));

      (useAuthStore as any).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Network error. Please check your connection.',
        clearError: mockClearError,
      });

      renderWithProviders(<LoginForm />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Integration', () => {
    it('should validate form before API call', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      // Try to submit without valid email
      await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Should show validation error, not call API
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should prevent multiple submissions', async () => {
      const user = userEvent.setup();

      (useAuthStore as any).mockReturnValue({
        login: mockLogin,
        isLoading: true, // Simulate loading state
        error: null,
        clearError: mockClearError,
      });

      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();

      // Button should be disabled during loading
      await user.click(submitButton);
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
