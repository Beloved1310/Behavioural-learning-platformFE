import { create } from 'zustand';
import { GamificationState, Quiz, QuizAttempt, GameBadge, LeaderboardEntry, Achievement, UserBadge, StudyStreak, UserProgress, QuizAnswer } from '../types';

interface GamificationStore extends GamificationState {
  // Quiz management
  loadQuizzes: (subject?: string, difficulty?: string) => Promise<void>;
  startQuiz: (quizId: string) => Promise<Quiz>;
  submitQuizAttempt: (quizId: string, answers: QuizAnswer[], timeSpent: number) => Promise<QuizAttempt>;
  
  // Badge system
  loadUserBadges: () => Promise<void>;
  loadAvailableBadges: () => Promise<void>;
  checkBadgeEligibility: (userId: string) => Promise<UserBadge[]>;
  
  // Leaderboard
  loadLeaderboard: (timeframe?: 'week' | 'month' | 'all') => Promise<void>;
  
  // Progress tracking
  loadUserProgress: () => Promise<void>;
  updateStudyStreak: () => Promise<void>;
  addXP: (amount: number, subject?: string) => Promise<void>;
  
  // User profile
  loadUserProfile: () => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  calculateLevel: (totalXP: number) => { level: number; currentXP: number; nextLevelXP: number };
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  userProfile: null,
  availableQuizzes: [],
  recentAttempts: [],
  leaderboard: [],
  availableBadges: [],
  subjectProgress: [],
  isLoading: false,
  error: null,

  loadQuizzes: async (subject?: string, difficulty?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const quizzes = await GameService.getQuizzes(subject, difficulty);
      
      // Mock quizzes data
      const mockQuizzes: Quiz[] = [
        {
          id: 'quiz1',
          title: 'Algebra Fundamentals',
          description: 'Test your knowledge of basic algebra concepts including linear equations and polynomials.',
          subject: 'Mathematics',
          difficulty: 'easy',
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: 'What is the value of x in the equation 2x + 5 = 15?',
              options: ['3', '5', '7', '10'],
              correctAnswer: 1, // index of correct answer
              explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
              points: 10
            },
            {
              id: 'q2',
              type: 'multiple_choice',
              question: 'Which of the following is a linear equation?',
              options: ['x² + 2x = 5', '3x + 7 = 12', 'x³ - 4 = 0', '2/x + 1 = 6'],
              correctAnswer: 1,
              explanation: 'A linear equation has variables to the first power only',
              points: 10
            }
          ],
          timeLimit: 15,
          pointsReward: 50,
          badgeReward: 'algebra_novice',
          completionCount: 1247,
          averageScore: 78,
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
          isActive: true,
          tags: ['algebra', 'equations', 'beginner']
        },
        {
          id: 'quiz2',
          title: 'English Grammar Quiz',
          description: 'Master the fundamentals of English grammar including parts of speech and sentence structure.',
          subject: 'English',
          difficulty: 'medium',
          questions: [
            {
              id: 'q3',
              type: 'multiple_choice',
              question: 'Which sentence is grammatically correct?',
              options: [
                'Me and my friend went to the store.',
                'My friend and I went to the store.',
                'My friend and me went to the store.',
                'I and my friend went to the store.'
              ],
              correctAnswer: 1,
              explanation: 'When the pronoun is part of the subject, use "I" not "me"',
              points: 15
            }
          ],
          timeLimit: 20,
          pointsReward: 75,
          completionCount: 892,
          averageScore: 72,
          createdAt: '2024-01-02T00:00:00Z',
          createdBy: 'system',
          isActive: true,
          tags: ['grammar', 'language', 'intermediate']
        },
        {
          id: 'quiz3',
          title: 'Basic Chemistry',
          description: 'Explore fundamental chemistry concepts including atoms, molecules, and chemical reactions.',
          subject: 'Science',
          difficulty: 'hard',
          questions: [
            {
              id: 'q4',
              type: 'multiple_choice',
              question: 'What is the chemical formula for water?',
              options: ['H₂O', 'CO₂', 'NaCl', 'CH₄'],
              correctAnswer: 0,
              explanation: 'Water consists of two hydrogen atoms and one oxygen atom',
              points: 20
            }
          ],
          timeLimit: 25,
          pointsReward: 100,
          completionCount: 456,
          averageScore: 65,
          createdAt: '2024-01-03T00:00:00Z',
          createdBy: 'system',
          isActive: true,
          tags: ['chemistry', 'atoms', 'advanced']
        }
      ];

      // Filter by subject and difficulty if provided
      let filteredQuizzes = mockQuizzes;
      if (subject) {
        filteredQuizzes = filteredQuizzes.filter(quiz => quiz.subject === subject);
      }
      if (difficulty) {
        filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === difficulty);
      }

      set({ availableQuizzes: filteredQuizzes, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load quizzes' 
      });
    }
  },

  startQuiz: async (quizId: string) => {
    const { availableQuizzes } = get();
    const quiz = availableQuizzes.find(q => q.id === quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // TODO: Replace with real API call to start quiz session
    // const quizSession = await GameService.startQuiz(quizId);
    
    return quiz;
  },

  submitQuizAttempt: async (quizId: string, answers: QuizAnswer[], timeSpent: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const attempt = await GameService.submitQuizAttempt(quizId, answers, timeSpent);
      
      // Mock quiz attempt submission
      const totalPointsEarned = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
      const totalPossiblePoints = answers.reduce((sum, answer) => sum + (answer.isCorrect ? answer.pointsEarned : 10), 0);
      const percentage = Math.round((totalPointsEarned / totalPossiblePoints) * 100);
      
      const attempt: QuizAttempt = {
        id: Date.now().toString(),
        quizId,
        userId: '1',
        score: totalPointsEarned,
        totalPoints: totalPossiblePoints,
        percentage,
        completedAt: new Date().toISOString(),
        timeSpent,
        answers,
        feedback: percentage >= 80 ? 'Excellent work!' : 
                 percentage >= 60 ? 'Good job! Keep practicing.' : 
                 'Keep studying and try again!'
      };

      const { recentAttempts } = get();
      set({ 
        recentAttempts: [attempt, ...recentAttempts.slice(0, 9)],
        isLoading: false 
      });

      // Add XP and check for badges
      await get().addXP(totalPointsEarned);
      await get().checkBadgeEligibility('1');

      return attempt;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to submit quiz attempt' 
      });
      throw error;
    }
  },

  loadUserBadges: async () => {
    try {
      // TODO: Replace with real API call
      // const badges = await GameService.getUserBadges();
      
      // This would be loaded as part of user profile
    } catch (error) {
      console.error('Failed to load user badges:', error);
    }
  },

  loadAvailableBadges: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const badges = await GameService.getAvailableBadges();
      
      // Mock available badges
      const mockBadges: GameBadge[] = [
        {
          id: 'badge1',
          name: 'First Steps',
          description: 'Complete your first quiz',
          icon: '👶',
          category: 'achievement',
          rarity: 'common',
          criteria: { type: 'quizzes_completed', threshold: 1 },
          pointsReward: 50,
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true
        },
        {
          id: 'badge2',
          name: 'Quiz Master',
          description: 'Score 90% or higher on 5 quizzes',
          icon: '🧠',
          category: 'quiz',
          rarity: 'rare',
          criteria: { type: 'quiz_score', threshold: 5 },
          pointsReward: 200,
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true
        },
        {
          id: 'badge3',
          name: 'Study Streak',
          description: 'Study for 7 consecutive days',
          icon: '🔥',
          category: 'streak',
          rarity: 'epic',
          criteria: { type: 'streak_days', threshold: 7 },
          pointsReward: 300,
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true
        },
        {
          id: 'badge4',
          name: 'Math Wizard',
          description: 'Complete 10 math quizzes',
          icon: '🧙‍♂️',
          category: 'study',
          rarity: 'legendary',
          criteria: { type: 'quizzes_completed', threshold: 10, subject: 'Mathematics' },
          pointsReward: 500,
          createdAt: '2024-01-01T00:00:00Z',
          isActive: true
        }
      ];

      set({ availableBadges: mockBadges, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load badges' 
      });
    }
  },

  checkBadgeEligibility: async (userId: string) => {
    try {
      // TODO: Replace with real API call
      // const newBadges = await GameService.checkBadgeEligibility(userId);
      
      // Mock badge checking logic
      const newBadges: UserBadge[] = [];
      
      // This would contain logic to check if user meets criteria for any badges
      // and award them automatically
      
      return newBadges;
    } catch (error) {
      console.error('Failed to check badge eligibility:', error);
      return [];
    }
  },

  loadLeaderboard: async (timeframe = 'all') => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const leaderboard = await GameService.getLeaderboard(timeframe);
      
      // Mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          userId: '1',
          userName: 'You',
          userRole: 'STUDENT',
          totalPoints: 1250,
          totalQuizzes: 15,
          averageScore: 85,
          currentStreak: 7,
          badges: [],
          rank: 3,
        },
        {
          id: '2',
          userId: '2',
          userName: 'Sarah Johnson',
          userRole: 'STUDENT',
          totalPoints: 1850,
          totalQuizzes: 22,
          averageScore: 92,
          currentStreak: 12,
          badges: [],
          rank: 1,
        },
        {
          id: '3',
          userId: '3',
          userName: 'Mike Chen',
          userRole: 'STUDENT',
          totalPoints: 1450,
          totalQuizzes: 18,
          averageScore: 88,
          currentStreak: 5,
          badges: [],
          rank: 2,
        },
        {
          id: '4',
          userId: '4',
          userName: 'Emma Davis',
          userRole: 'STUDENT',
          totalPoints: 1100,
          totalQuizzes: 12,
          averageScore: 83,
          currentStreak: 3,
          badges: [],
          rank: 4,
        },
        {
          id: '5',
          userId: '5',
          userName: 'Alex Wilson',
          userRole: 'STUDENT',
          totalPoints: 950,
          totalQuizzes: 10,
          averageScore: 80,
          currentStreak: 2,
          badges: [],
          rank: 5,
        }
      ];

      set({ leaderboard: mockLeaderboard, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load leaderboard' 
      });
    }
  },

  loadUserProgress: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const progress = await GameService.getUserProgress();
      
      // Mock subject progress
      const mockProgress: UserProgress[] = [
        {
          id: '1',
          userId: '1',
          subject: 'Mathematics',
          level: 3,
          currentXP: 450,
          nextLevelXP: 600,
          totalXP: 1050,
          completedQuizzes: 8,
          averageScore: 87,
          studyTime: 240,
          lastActivity: '2024-01-14T10:30:00Z'
        },
        {
          id: '2',
          userId: '1',
          subject: 'English',
          level: 2,
          currentXP: 200,
          nextLevelXP: 400,
          totalXP: 600,
          completedQuizzes: 5,
          averageScore: 82,
          studyTime: 180,
          lastActivity: '2024-01-13T14:20:00Z'
        },
        {
          id: '3',
          userId: '1',
          subject: 'Science',
          level: 2,
          currentXP: 100,
          nextLevelXP: 400,
          totalXP: 500,
          completedQuizzes: 3,
          averageScore: 75,
          studyTime: 120,
          lastActivity: '2024-01-12T16:45:00Z'
        }
      ];

      set({ subjectProgress: mockProgress, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user progress' 
      });
    }
  },

  updateStudyStreak: async () => {
    try {
      // TODO: Replace with real API call
      // await GameService.updateStudyStreak();
      
      // This would update the user's study streak
      console.log('Study streak updated');
    } catch (error) {
      console.error('Failed to update study streak:', error);
    }
  },

  addXP: async (amount: number, subject?: string) => {
    try {
      // TODO: Replace with real API call
      // await GameService.addXP(amount, subject);
      
      const { userProfile, subjectProgress } = get();
      
      if (userProfile) {
        const newTotalXP = userProfile.totalXP + amount;
        const { level, currentXP, nextLevelXP } = get().calculateLevel(newTotalXP);
        
        set({
          userProfile: {
            ...userProfile,
            totalPoints: userProfile.totalPoints + amount,
            totalXP: newTotalXP,
            level,
            currentXP,
            nextLevelXP
          }
        });
      }

      // Update subject progress if specified
      if (subject) {
        const updatedProgress = subjectProgress.map(progress => {
          if (progress.subject === subject) {
            const newTotalXP = progress.totalXP + amount;
            const { level, currentXP, nextLevelXP } = get().calculateLevel(newTotalXP);
            
            return {
              ...progress,
              totalXP: newTotalXP,
              level,
              currentXP,
              nextLevelXP,
              lastActivity: new Date().toISOString()
            };
          }
          return progress;
        });
        
        set({ subjectProgress: updatedProgress });
      }
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  },

  loadUserProfile: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const profile = await GameService.getUserProfile();
      
      // Mock user profile
      const mockProfile = {
        totalPoints: 1250,
        level: 5,
        currentXP: 250,
        nextLevelXP: 500,
        badges: [
          {
            id: 'ub1',
            userId: '1',
            badgeId: 'badge1',
            badge: {
              id: 'badge1',
              name: 'First Steps',
              description: 'Complete your first quiz',
              icon: '👶',
              category: 'achievement' as const,
              rarity: 'common' as const,
              criteria: { type: 'quizzes_completed' as const, threshold: 1 },
              pointsReward: 50,
              createdAt: '2024-01-01T00:00:00Z',
              isActive: true
            },
            earnedAt: '2024-01-10T12:00:00Z'
          }
        ],
        achievements: [
          {
            id: 'ach1',
            title: 'Quiz Rookie',
            description: 'Completed your first quiz successfully',
            icon: '🎯',
            pointsEarned: 100,
            unlockedAt: '2024-01-10T12:00:00Z',
            category: 'milestone' as const
          }
        ],
        streak: {
          id: 'streak1',
          userId: '1',
          currentStreak: 7,
          longestStreak: 12,
          lastStudyDate: '2024-01-14T00:00:00Z',
          streakStartDate: '2024-01-08T00:00:00Z',
          isActive: true
        },
        rank: 3
      };

      set({ userProfile: mockProfile, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user profile' 
      });
    }
  },

  calculateLevel: (totalXP: number) => {
    // Level calculation: Each level requires more XP (exponential growth)
    const baseXP = 100;
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = baseXP;
    
    while (totalXP >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, level - 1));
    }
    
    const currentXP = totalXP - xpForCurrentLevel;
    const nextLevelXP = xpForNextLevel - xpForCurrentLevel;
    
    return { level, currentXP, nextLevelXP };
  },

  clearError: () => set({ error: null })
}));