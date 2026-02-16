import { apiService } from './api';
import { logger } from '../utils/logger';

export interface StudentProgress {
  id: string;
  name: string;
  email: string;
  streak: number;
  goalProgress: number;
  commitmentsCompleted: number;
  commitmentsTotal: number;
  consistencyScore: number;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  lastLoginAt?: string;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  reasons: string[];
  priority: 'urgent' | 'attention';
}

class TutorStudentsService {
  private readonly BASE_PATH = '/v1/api/tutor';

  async getAllStudentsProgress(
    page?: number,
    limit?: number
  ): Promise<{ students: StudentProgress[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const url = `${this.BASE_PATH}/students/progress${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiService.get<any>(url);

      // Handle paginated response
      if (response && response.success && response.students && response.pagination) {
        return {
          students: response.students,
          pagination: response.pagination,
        };
      }

      // Handle different response structures (backward compatibility)
      if (response && typeof response === 'object') {
        // Check if response has students directly
        if ('students' in response && Array.isArray((response as any).students)) {
          return { students: (response as any).students };
        }
        // Check if response has data.students
        if ('data' in response && (response as any).data && 'students' in (response as any).data) {
          return { students: (response as any).data.students };
        }
        // Check if response is the data directly
        if (Array.isArray(response)) {
          return { students: response };
        }
      }

      logger.warn('Unexpected response structure', { response });
      return { students: [] };
    } catch (error) {
      logger.error('Failed to get all students progress', error);
      // Return empty array instead of throwing to prevent UI crashes
      return { students: [] };
    }
  }

  async getAtRiskStudents(): Promise<AtRiskStudent[]> {
    try {
      const response = await apiService.get<{
        success: boolean;
        students: AtRiskStudent[];
        total: number;
      }>(`${this.BASE_PATH}/students/at-risk`);

      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check if response has students directly
        if ('students' in response && Array.isArray((response as any).students)) {
          return (response as any).students;
        }
        // Check if response has data.students
        if ('data' in response && (response as any).data && 'students' in (response as any).data) {
          return (response as any).data.students;
        }
        // Check if response is the data directly
        if (Array.isArray(response)) {
          return response;
        }
      }

      logger.warn('Unexpected response structure', { response });
      return [];
    } catch (error) {
      logger.error('Failed to get at-risk students', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async getStudentDetail(studentId: string): Promise<any> {
    try {
      const response = await apiService.get<{ success: boolean; student: any }>(
        `${this.BASE_PATH}/students/${studentId}`
      );

      if (response && typeof response === 'object') {
        if ('student' in response) {
          return (response as any).student;
        }
        if ('data' in response && (response as any).data && 'student' in (response as any).data) {
          return (response as any).data.student;
        }
        if ((response as any).id) {
          return response as any;
        }
      }

      throw new Error('Invalid response format');
    } catch (error) {
      logger.error('Failed to get student detail', error);
      throw error;
    }
  }

  async searchStudents(
    query?: string,
    status?: string,
    sortBy?: string
  ): Promise<StudentProgress[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (status) params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await apiService.get<{
        success: boolean;
        students: StudentProgress[];
        total: number;
      }>(`${this.BASE_PATH}/students/search${params.toString() ? `?${params.toString()}` : ''}`);

      if (response && typeof response === 'object') {
        if ('students' in response && Array.isArray((response as any).students)) {
          return (response as any).students;
        }
        if ('data' in response && (response as any).data && 'students' in (response as any).data) {
          return (response as any).data.students;
        }
        if (Array.isArray(response)) {
          return response;
        }
      }

      return [];
    } catch (error) {
      logger.error('Failed to search students', error);
      return [];
    }
  }

  async inviteStudent(email: string, message?: string): Promise<void> {
    try {
      await apiService.post(`${this.BASE_PATH}/students/invite`, { email, message });
    } catch (error) {
      logger.error('Failed to invite student', error);
      throw error;
    }
  }

  async createStudent(data: {
    firstName: string;
    lastName: string;
    email: string;
    gradeLevel?: string;
    academicGoals?: string[];
    parentEmail?: string;
  }): Promise<any> {
    try {
      const response = await apiService.post<{ success: boolean; student: any }>(
        `${this.BASE_PATH}/students/create`,
        data
      );

      if (response && typeof response === 'object') {
        if ('student' in response) {
          return (response as any).student;
        }
        if ('data' in response && (response as any).data && 'student' in (response as any).data) {
          return (response as any).data.student;
        }
      }

      return response as any;
    } catch (error) {
      logger.error('Failed to create student', error);
      throw error;
    }
  }
}

export const tutorStudentsService = new TutorStudentsService();
