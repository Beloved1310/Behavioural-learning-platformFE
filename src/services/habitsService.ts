import { apiService } from './api';

export interface HeatmapDay {
  date: string;
  activity: number; // 0-3
  count: number;
}

export interface Streak {
  type: 'login' | 'study' | 'quiz';
  name: string;
  days: number;
  icon: string;
}

class HabitsService {
  private readonly BASE_PATH = '/v1/api/habits';

  async getHeatmap(days: number = 30): Promise<HeatmapDay[]> {
    const response = await apiService.get<{ success: boolean; heatmap: HeatmapDay[] }>(
      `${this.BASE_PATH}/heatmap?days=${days}`
    );
    return response.heatmap || [];
  }

  async getStreaks(): Promise<Streak[]> {
    const response = await apiService.get<{ success: boolean; streaks: Streak[] }>(
      `${this.BASE_PATH}/streaks`
    );
    return response.streaks || [];
  }
}

export const habitsService = new HabitsService();
