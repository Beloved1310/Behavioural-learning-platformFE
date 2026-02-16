import { apiService } from './api';

export interface ReflectionEntry {
  id: string;
  date: string;
  prompt: string;
  response: string;
  type: 'daily' | 'weekly' | 'session';
  mood?: string;
  tutorFeedback?: {
    tutorId: string;
    comment: string;
    feedbackAt: string;
    isRead: boolean;
  };
  createdAt: string;
}

export interface CreateReflectionRequest {
  prompt: string;
  response: string;
  type?: 'daily' | 'weekly' | 'session';
  mood?: string;
}

export interface ReflectionInsights {
  streak: number;
  totalReflections: number;
  patterns: string[];
}

class ReflectionsService {
  private readonly BASE_PATH = '/v1/api/reflections';

  async getReflections(
    period: 'week' | 'all' = 'week',
    limit?: number
  ): Promise<ReflectionEntry[]> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (limit) params.append('limit', limit.toString());

    const response = await apiService.get<{ success: boolean; reflections: ReflectionEntry[] }>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.reflections || [];
  }

  async createReflection(data: CreateReflectionRequest): Promise<ReflectionEntry> {
    const response = await apiService.post<{ success: boolean; reflection: ReflectionEntry }>(
      this.BASE_PATH,
      data
    );
    return response.reflection;
  }

  async getInsights(): Promise<ReflectionInsights> {
    const response = await apiService.get<{ success: boolean; insights: ReflectionInsights }>(
      `${this.BASE_PATH}/insights`
    );
    return response.insights;
  }

  async getTodayPrompt(): Promise<string[]> {
    const response = await apiService.get<{ success: boolean; prompts: string[] }>(
      `${this.BASE_PATH}/prompts/today`
    );
    return response.prompts || [];
  }
}

export const reflectionsService = new ReflectionsService();
