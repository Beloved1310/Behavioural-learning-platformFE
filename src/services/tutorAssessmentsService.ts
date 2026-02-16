import { apiService } from './api';

export interface StudentAssessment {
  id: string;
  userId: string;
  weekStart: string;
  weekRating: number;
  whatWentWell: string;
  challenges: string;
  nextWeekFocus: string;
  commitmentLevel: number;
  tutorFeedback?: {
    tutorId: string;
    comment: string;
    encouragementLevel: 'low' | 'medium' | 'high';
    feedbackAt: string;
    isRead: boolean;
  };
  completedAt: string;
  createdAt: string;
}

export interface PendingAssessmentsResponse {
  success: boolean;
  assessments: StudentAssessment[];
  pagination?: any;
}

export interface AddFeedbackRequest {
  comment: string;
  encouragementLevel?: 'low' | 'medium' | 'high';
}

class TutorAssessmentsService {
  private readonly BASE_PATH = '/v1/api/tutor';

  async getStudentAssessments(studentId: string): Promise<StudentAssessment[]> {
    const response = await apiService.get<{ success: boolean; assessments: StudentAssessment[] }>(
      `${this.BASE_PATH}/students/${studentId}/assessments`
    );
    return response.assessments || [];
  }

  async getPendingFeedback(): Promise<PendingAssessmentsResponse> {
    const response = await apiService.get<PendingAssessmentsResponse>(
      `${this.BASE_PATH}/assessments/pending`
    );
    return response;
  }

  async addFeedback(assessmentId: string, data: AddFeedbackRequest): Promise<void> {
    await apiService.post<{ success: boolean }>(
      `${this.BASE_PATH}/assessments/${assessmentId}/feedback`,
      data
    );
  }
}

export const tutorAssessmentsService = new TutorAssessmentsService();
