import { apiService } from './api';

export interface UpcomingMilestone {
  type: 'goal' | 'streak';
  goalId?: string;
  goalTitle?: string;
  current: number;
  target: number;
  milestonePercent?: number;
}

export interface NewMilestone {
  type: 'goal' | 'streak';
  goalId?: string;
  goalTitle?: string;
  title: string;
  description: string;
  icon: string;
  milestone: number;
}

class MilestonesService {
  private readonly BASE_PATH = '/v1/api/milestones';

  async getUpcoming(): Promise<UpcomingMilestone | null> {
    const response = await apiService.get<{ success: boolean; upcoming: UpcomingMilestone | null }>(
      `${this.BASE_PATH}/upcoming`
    );
    return response.upcoming || null;
  }

  async checkMilestones(): Promise<{ newMilestones: NewMilestone[]; hasNewMilestones: boolean }> {
    const response = await apiService.post<{
      success: boolean;
      newMilestones: NewMilestone[];
      hasNewMilestones: boolean;
    }>(`${this.BASE_PATH}/check`, {});
    return {
      newMilestones: response.newMilestones || [],
      hasNewMilestones: response.hasNewMilestones || false,
    };
  }
}

export const milestonesService = new MilestonesService();
