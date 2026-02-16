import { apiService } from './api';

export interface CommitmentItem {
  text: string;
  type: 'time' | 'quizzes' | 'sessions';
  target: number;
  completed: boolean;
  completedAt?: string;
}

export interface AssignedCommitment {
  id: string;
  studentId: string;
  studentName: string;
  weekStart: string;
  weekEnd: string;
  commitments: CommitmentItem[];
  completionRate: number;
  assignedAt: string;
}

export interface AssignCommitmentRequest {
  commitments: CommitmentItem[];
  weekStart?: string;
}

class TutorCommitmentsService {
  private readonly BASE_PATH = '/v1/api/tutor';

  async assignCommitment(
    studentId: string,
    data: AssignCommitmentRequest
  ): Promise<AssignedCommitment> {
    const response = await apiService.post<{ success: boolean; commitment: AssignedCommitment }>(
      `${this.BASE_PATH}/students/${studentId}/commitments`,
      data
    );
    return response.commitment;
  }

  async getAssignedCommitments(): Promise<AssignedCommitment[]> {
    const response = await apiService.get<{
      success: boolean;
      commitments: AssignedCommitment[];
      total: number;
    }>(`${this.BASE_PATH}/commitments/assigned`);
    return response.commitments || [];
  }
}

export const tutorCommitmentsService = new TutorCommitmentsService();
