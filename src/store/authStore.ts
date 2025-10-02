import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../services/authService';
import { User, AuthState, LoginRequest, RegisterRequest } from '../types';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Uncomment for real API call
          // const user = await AuthService.login(credentials);
          
          // Mock user data for development
          const user = {
            id: '1',
            email: credentials.email,
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT' as const,
            createdAt: new Date().toISOString(),
          };
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Uncomment for real API call
          // await AuthService.register(userData);
          
          // Mock successful registration
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ isLoading: false, error: null });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        }
      },

      getProfile: async () => {
        if (!AuthService.isAuthenticated()) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const user = await AuthService.getProfile();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          });
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to get profile' 
          });
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);