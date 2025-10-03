import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../store/gamificationStore';
import { useAuthStore } from '../store/authStore';
import { Quiz, QuizAttempt } from '../types';
import { GameLayout } from '../components/layout';

import { QuizCard } from '../components/gamification/QuizCard';
import { QuizTaking } from '../components/gamification/QuizTaking';
import { BadgeDisplay, BadgeShowcase } from '../components/gamification/BadgeDisplay';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { LevelProgress, ProgressBar, StreakDisplay } from '../components/gamification/ProgressBar';

export const Gamification: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    userProfile,
    availableQuizzes,
    recentAttempts,
    subjectProgress,
    loadQuizzes,
    loadUserProfile,
    loadUserProgress,
    loadAvailableBadges,
    startQuiz,
    isLoading
  } = useGamificationStore();

  const [activeTab, setActiveTab] = useState<'quizzes' | 'badges' | 'leaderboard' | 'progress'>('quizzes');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showBadgeShowcase, setShowBadgeShowcase] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    loadUserProfile();
    loadUserProgress();
    loadAvailableBadges();
    loadQuizzes(selectedSubject || undefined, selectedDifficulty || undefined);
  }, [user, selectedSubject, selectedDifficulty]);

  const handleStartQuiz = async (quizId: string) => {
    try {
      const quiz = await startQuiz(quizId);
      setActiveQuiz(quiz);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setActiveQuiz(null);
    
    // Check if user earned any new badges
    if (attempt.percentage >= 90) {
      // Mock badge earning
      const mockBadge = {
        id: 'ub_new',
        userId: user?.id || '1',
        badgeId: 'quiz_master',
        badge: {
          id: 'quiz_master',
          name: 'Quiz Master',
          description: 'Scored 90% or higher on a quiz',
          icon: '🧠',
          category: 'quiz' as const,
          rarity: 'rare' as const,
          criteria: { type: 'quiz_score' as const, threshold: 90 },
          pointsReward: 200,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        earnedAt: new Date().toISOString()
      };
      
      setNewBadge(mockBadge);
      setShowBadgeShowcase(true);
    }
  };

  const handleQuizExit = () => {
    setActiveQuiz(null);
  };

  const subjects = [...new Set(availableQuizzes.map(quiz => quiz.subject))];
  const difficulties = ['easy', 'medium', 'hard'];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access gamification features.
          </p>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <QuizTaking
        quiz={activeQuiz}
        onComplete={handleQuizComplete}
        onExit={handleQuizExit}
      />
    );
  }

  return (
    <GameLayout enableSidebarToggle={true}>
      <div className="space-y-6">
        {/* User Profile Summary */}
        {userProfile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <LevelProgress
              currentXP={userProfile.currentXP}
              nextLevelXP={userProfile.nextLevelXP}
              level={userProfile.level}
            />
            
            <StreakDisplay
              currentStreak={userProfile.streak.currentStreak}
              longestStreak={userProfile.streak.longestStreak}
              isActive={userProfile.streak.isActive}
            />
            
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-2xl text-purple-600">
                    #{userProfile.rank}
                  </div>
                  <div className="text-sm text-gray-600">Global Rank</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg text-blue-800">
                    {userProfile.totalPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              {[
                { id: 'quizzes', label: '🧠 Quizzes', count: availableQuizzes.length },
                { id: 'badges', label: '🏆 Badges', count: userProfile?.badges.length || 0 },
                { id: 'leaderboard', label: '🏅 Leaderboard' },
                { id: 'progress', label: '📊 Progress' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'quizzes' && (
          <div>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input w-auto"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input w-auto"
              >
                <option value="">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Recent Attempts */}
            {recentAttempts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Recent Quiz</span>
                        <span className={`text-sm font-medium ${
                          attempt.percentage >= 80 ? 'text-green-600' :
                          attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {attempt.score}/{attempt.totalPoints} points
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Available Quizzes ({availableQuizzes.length})
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : availableQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {availableQuizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      onStartQuiz={handleStartQuiz}
                      isLoading={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or check back later for new quizzes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">🏆 Your Badges</h2>
              <p className="text-gray-600">Collect badges by completing challenges and reaching milestones!</p>
            </div>
            
            {userProfile?.badges && userProfile.badges.length > 0 ? (
              <BadgeDisplay
                badges={userProfile.badges}
                showProgress={true}
                size="large"
                layout="grid"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
                <p className="text-gray-600">
                  Start taking quizzes to earn your first badges!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <Leaderboard showCurrentUser={true} maxEntries={10} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">📊 Your Progress</h2>
              <p className="text-gray-600">Track your learning journey across different subjects.</p>
            </div>
            
            {subjectProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjectProgress.map((progress) => (
                  <div key={progress.id} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        📚 {progress.subject}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Level {progress.level}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <ProgressBar
                        current={progress.currentXP}
                        max={progress.nextLevelXP}
                        label="XP Progress"
                        color="purple"
                        showValues={true}
                        showPercentage={true}
                      />
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {progress.completedQuizzes}
                          </div>
                          <div className="text-xs text-gray-500">Quizzes</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {progress.averageScore}%
                          </div>
                          <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {Math.floor(progress.studyTime / 60)}h
                          </div>
                          <div className="text-xs text-gray-500">Study Time</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Last activity: {new Date(progress.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
                <p className="text-gray-600">
                  Complete some quizzes to see your progress tracking!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badge Showcase Modal */}
      {showBadgeShowcase && newBadge && (
        <BadgeShowcase
          userBadge={newBadge}
          onClose={() => {
            setShowBadgeShowcase(false);
            setNewBadge(null);
          }}
        />
      )}
    </GameLayout>
  );
};