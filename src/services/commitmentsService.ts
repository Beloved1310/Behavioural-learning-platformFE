import { apiService } from './api';

export interface CommitmentItem {
  text: string;
  type: 'time' | 'quizzes' | 'sessions';
  target: number;
  completed: boolean;
  completedAt?: string;
}

export interface WeeklyCommitment {
  id: string;
  weekStart: string;
  weekEnd: string;
  commitments: CommitmentItem[];
  assignedBy?: string;
}

export interface CreateCommitmentRequest {
  commitments: Array<{
    text: string;
    type: 'time' | 'quizzes' | 'sessions';
    target: number;
  }>;
}

class CommitmentsService {
  private readonly BASE_PATH = '/v1/api/commitments';

  async getCurrentCommitments(): Promise<{
    commitment: WeeklyCommitment | null;
    completionRate: number;
  }> {
    const response = await apiService.get<{
      success: boolean;
      commitment: WeeklyCommitment | null;
      completionRate: number;
    }>(`${this.BASE_PATH}/current`);
    return {
      commitment: response.commitment || null,
      completionRate: response.completionRate || 0,
    };
  }

  async createCommitments(data: CreateCommitmentRequest): Promise<WeeklyCommitment> {
    const response = await apiService.post<{ success: boolean; commitment: WeeklyCommitment }>(
      `${this.BASE_PATH}/weekly`,
      data
    );
    return response.commitment;
  }

  async toggleCommitment(
    commitmentId: string,
    itemIndex: number
  ): Promise<{
    commitment: WeeklyCommitment;
    completionRate: number;
  }> {
    const response = await apiService.patch<{
      success: boolean;
      commitment: WeeklyCommitment;
      completionRate: number;
    }>(`${this.BASE_PATH}/${commitmentId}/complete/${itemIndex}`, {});
    return {
      commitment: response.commitment,
      completionRate: response.completionRate,
    };
  }

  async getHistory(limit?: number): Promise<
    Array<{
      id: string;
      weekStart: string;
      weekEnd: string;
      completionRate: number;
      totalCommitments: number;
      completedCommitments: number;
    }>
  > {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiService.get<{ success: boolean; history: any[] }>(
      `${this.BASE_PATH}/history${params}`
    );
    return response.history || [];
  }

  async deleteCommitment(commitmentId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${commitmentId}`);
  }
}

export const commitmentsService = new CommitmentsService();
