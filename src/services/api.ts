import axios, { AxiosInstance, AxiosResponse } from 'axios';
// import { ApiResponse } from '../types/index';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.api.post('/auth/refresh');
            const { accessToken } = response.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.delete(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.patch(url, data);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;