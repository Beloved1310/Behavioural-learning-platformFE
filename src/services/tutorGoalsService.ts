import { apiService } from './api';

export interface AssignedGoal {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  progressPercent: number;
  deadline?: string;
  milestones: number[];
  achievedMilestones: number[];
  assignedAt: string;
  createdAt: string;
}

export interface PendingGoal {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  deadline?: string;
  createdAt: string;
}

export interface AssignGoalRequest {
  title: string;
  description?: string;
  target: number;
  deadline?: string;
  milestones?: number[];
}

class TutorGoalsService {
  private readonly BASE_PATH = '/v1/api/tutor';

  async getAssignedGoals(): Promise<AssignedGoal[]> {
    const response = await apiService.get<{
      success: boolean;
      goals: AssignedGoal[];
      total: number;
    }>(`${this.BASE_PATH}/goals/assigned`);
    return response.goals || [];
  }

  async getPendingGoals(): Promise<PendingGoal[]> {
    const response = await apiService.get<{
      success: boolean;
      goals: PendingGoal[];
      total: number;
    }>(`${this.BASE_PATH}/goals/pending`);
    return response.goals || [];
  }

  async assignGoal(studentId: string, data: AssignGoalRequest): Promise<AssignedGoal> {
    const response = await apiService.post<{ success: boolean; goal: AssignedGoal }>(
      `${this.BASE_PATH}/students/${studentId}/goals`,
      data
    );
    return response.goal;
  }

  async approveGoal(goalId: string): Promise<void> {
    await apiService.post<{
      success: boolean;
      goal: { id: string; status: string; message: string };
    }>(`${this.BASE_PATH}/goals/${goalId}/approve`);
  }

  async rejectGoal(goalId: string, feedback: string): Promise<void> {
    await apiService.post<{
      success: boolean;
      goal: { id: string; status: string; tutorFeedback: string; message: string };
    }>(`${this.BASE_PATH}/goals/${goalId}/reject`, { feedback });
  }
}

export const tutorGoalsService = new TutorGoalsService();
