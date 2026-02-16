import { apiService } from './api';

export interface WeeklyAssessment {
  id: string;
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
}

export interface CreateAssessmentRequest {
  weekRating: number;
  whatWentWell: string;
  challenges: string;
  nextWeekFocus: string;
  commitmentLevel: number;
}

export interface AssessmentTrends {
  weekRatings: Array<{ week: string; rating: number }>;
  commitmentLevels: Array<{ week: string; level: number }>;
}

class AssessmentsService {
  private readonly BASE_PATH = '/v1/api/assessments';

  async getCurrentAssessment(): Promise<WeeklyAssessment | null> {
    const response = await apiService.get<{
      success: boolean;
      assessment: WeeklyAssessment | null;
    }>(`${this.BASE_PATH}/current`);
    return response.assessment || null;
  }

  async submitAssessment(data: CreateAssessmentRequest): Promise<WeeklyAssessment> {
    const response = await apiService.post<{ success: boolean; assessment: WeeklyAssessment }>(
      `${this.BASE_PATH}/weekly`,
      data
    );
    return response.assessment;
  }

  async getTrends(weeks?: number): Promise<AssessmentTrends> {
    const params = weeks ? `?weeks=${weeks}` : '';
    const response = await apiService.get<{ success: boolean; trends: AssessmentTrends }>(
      `${this.BASE_PATH}/trends${params}`
    );
    return response.trends;
  }

  // Get assessment with tutor feedback (for students)
  async getAssessmentWithFeedback(assessmentId: string): Promise<WeeklyAssessment | null> {
    // This would typically be a student endpoint, but for now we'll use current
    const assessment = await this.getCurrentAssessment();
    return assessment;
  }
}

export const assessmentsService = new AssessmentsService();
