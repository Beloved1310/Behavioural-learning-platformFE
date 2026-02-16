import { apiService } from './api';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  milestones: number[];
  achievedMilestones: number[];
  assignedBy?: string;
  assignedAt?: string;
  status?: 'active' | 'pending_approval' | 'rejected';
  tutorFeedback?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  target: number;
  deadline?: string;
  milestones?: number[];
}

class GoalsService {
  private readonly BASE_PATH = '/v1/api/goals';

  async getGoals(): Promise<Goal[]> {
    const response = await apiService.get<{ success: boolean; goals: Goal[] }>(
      `${this.BASE_PATH}/progress`
    );
    return response.goals || [];
  }

  async createGoal(data: CreateGoalRequest): Promise<Goal> {
    const response = await apiService.post<{ success: boolean; goal: Goal }>(this.BASE_PATH, data);
    return response.goal;
  }

  async updateProgress(goalId: string): Promise<{ current: number; achievedMilestones: number[] }> {
    const response = await apiService.post<{
      success: boolean;
      goal: { current: number; achievedMilestones: number[] };
    }>(`${this.BASE_PATH}/${goalId}/progress`, {});
    return response.goal;
  }

  async getMilestones(goalId: string): Promise<{
    current: number;
    target: number;
    progressPercent: number;
    upcoming: number[];
    achieved: number[];
  }> {
    const response = await apiService.get<{ success: boolean; milestones: any }>(
      `${this.BASE_PATH}/${goalId}/milestones`
    );
    return response.milestones;
  }

  async deleteGoal(goalId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${goalId}`);
  }
}

export const goalsService = new GoalsService();
