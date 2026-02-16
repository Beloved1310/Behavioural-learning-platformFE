import { apiService } from './api';

export interface TutorFeedback {
  tutorId: string;
  comment: string;
  feedbackAt: string;
  isRead: boolean;
}

export interface StudentReflection {
  id: string;
  date: string;
  prompt: string;
  response: string;
  type: 'daily' | 'weekly' | 'session';
  mood?: string;
  tutorFeedback?: TutorFeedback;
  createdAt: string;
}

export interface PendingReflection {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  prompt: string;
  response: string;
  type: 'daily' | 'weekly' | 'session';
  mood?: string;
  createdAt: string;
}

export interface AddFeedbackRequest {
  comment: string;
}

class TutorReflectionsService {
  private readonly BASE_PATH = '/v1/api/tutor';

  async getStudentReflections(studentId: string, limit?: number): Promise<StudentReflection[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiService.get<{
      success: boolean;
      reflections: StudentReflection[];
      total: number;
    }>(`${this.BASE_PATH}/students/${studentId}/reflections${params}`);
    return response.reflections || [];
  }

  async getPendingFeedback(limit?: number): Promise<PendingReflection[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiService.get<{
      success: boolean;
      reflections: PendingReflection[];
      total: number;
    }>(`${this.BASE_PATH}/reflections/pending${params}`);
    return response.reflections || [];
  }

  async addFeedback(reflectionId: string, data: AddFeedbackRequest): Promise<StudentReflection> {
    const response = await apiService.post<{ success: boolean; reflection: StudentReflection }>(
      `${this.BASE_PATH}/reflections/${reflectionId}/feedback`,
      data
    );
    return response.reflection;
  }
}

export const tutorReflectionsService = new TutorReflectionsService();
