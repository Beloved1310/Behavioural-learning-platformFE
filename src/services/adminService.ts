import { apiService } from './api';
import { UserRole } from '../types';

export interface PendingTutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  subjects: string[];
  qualifications: string[];
  bio?: string;
  hourlyRate?: number;
  isVerified: boolean;
  isBackgroundChecked: boolean;
  createdAt: string;
}

export interface TutorDetail extends PendingTutor {
  rating: number;
  totalSessions: number;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  isVerified: boolean;
  isBackgroundChecked: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserDetail extends User {
  gradeLevel?: string;
  academicGoals?: string[];
  streakCount?: number;
  totalPoints?: number;
  subjects?: string[];
  qualifications?: string[];
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  totalSessions?: number;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalParents: number;
  pendingTutors: number;
  verifiedTutors: number;
  activeUsers: number;
}

class AdminService {
  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiService.get<{ success: boolean; stats: DashboardStats }>(
      '/v1/api/admin/dashboard/stats'
    );
    if (!response.success || !(response as any).stats) {
      throw new Error(response.error || 'Failed to fetch dashboard stats');
    }
    return (response as any).stats;
  }

  // Tutor management
  async getPendingTutors(page: number = 1, limit: number = 20) {
    const response = await apiService.get<{
      success: boolean;
      tutors: PendingTutor[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`/v1/api/admin/tutors/pending?page=${page}&limit=${limit}`);

    if (!response.success || !(response as any).tutors) {
      throw new Error(response.error || 'Failed to fetch pending tutors');
    }
    return {
      tutors: (response as any).tutors,
      pagination: (response as any).pagination,
    };
  }

  async getTutorById(tutorId: string): Promise<TutorDetail> {
    const response = await apiService.get<{ success: boolean; tutor: TutorDetail }>(
      `/v1/api/admin/tutors/${tutorId}`
    );
    if (!response.success || !(response as any).tutor) {
      throw new Error(response.error || 'Failed to fetch tutor details');
    }
    return (response as any).tutor;
  }

  async approveTutor(tutorId: string, adminNotes?: string) {
    const response = await apiService.post<{ success: boolean; message: string; tutor: any }>(
      `/v1/api/admin/tutors/${tutorId}/approve`,
      { adminNotes }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to approve tutor');
    }
    return {
      message: (response as any).message,
      tutor: (response as any).tutor,
    };
  }

  async rejectTutor(tutorId: string, reason: string) {
    const response = await apiService.post<{ success: boolean; message: string }>(
      `/v1/api/admin/tutors/${tutorId}/reject`,
      { reason }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to reject tutor');
    }
    return {
      message: (response as any).message,
      tutorId: (response as any).tutorId,
    };
  }

  async setBackgroundCheckStatus(tutorId: string, isBackgroundChecked: boolean) {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      tutor: { id: string; isBackgroundChecked: boolean };
    }>(`/v1/api/admin/tutors/${tutorId}/background-check`, { isBackgroundChecked });
    if (!response.success) {
      throw new Error(response.error || 'Failed to update background check status');
    }
    return {
      message: (response as any).message,
      tutor: (response as any).tutor,
    };
  }

  // User management
  async getAllUsers(filters: {
    role?: UserRole;
    search?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.isVerified !== undefined) params.append('isVerified', String(filters.isVerified));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await apiService.get<{
      success: boolean;
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`/v1/api/admin/users?${params.toString()}`);

    if (!response.success || !(response as any).users) {
      throw new Error(response.error || 'Failed to fetch users');
    }
    return {
      users: (response as any).users,
      pagination: (response as any).pagination,
    };
  }

  async getUserById(userId: string): Promise<UserDetail> {
    const response = await apiService.get<{ success: boolean; user: UserDetail }>(
      `/v1/api/admin/users/${userId}`
    );
    if (!response.success || !(response as any).user) {
      throw new Error(response.error || 'Failed to fetch user details');
    }
    return (response as any).user;
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const response = await apiService.patch<{ success: boolean; message: string; user: any }>(
      `/v1/api/admin/users/${userId}/status`,
      { isActive }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user status');
    }
    return {
      message: (response as any).message,
      user: (response as any).user,
    };
  }
}

export const adminService = new AdminService();
