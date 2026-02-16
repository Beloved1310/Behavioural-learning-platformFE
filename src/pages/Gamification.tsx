import React, { useState, useEffect } from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { useAuthStore } from '../store/authStore';
import { Quiz, QuizAttempt } from '../types';
import { DashboardLayout } from '../components/layout/MainLayout';
import { useToast } from '../contexts/ToastContext';

import { QuizCard } from '../components/gamification/QuizCard';
import { QuizTaking } from '../components/gamification/QuizTaking';
import { BadgeDisplay, BadgeShowcase } from '../components/gamification/BadgeDisplay';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { LevelProgress, ProgressBar, StreakDisplay } from '../components/gamification/ProgressBar';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const Gamification: React.FC = () => {
  console.log('[Gamification] Component rendering');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { showError, showWarning } = useToast();
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
    isLoading,
    error,
  } = useGamificationStore();

  console.log('[Gamification] Store state:', {
    hasUser: !!user,
    userProfile: !!userProfile,
    quizzesCount: availableQuizzes?.length || 0,
    attemptsCount: recentAttempts?.length || 0,
    progressCount: subjectProgress?.length || 0,
    isLoading,
    error,
  });

  // Get initial tab from URL params, default to 'quizzes'
  const tabFromUrl = searchParams.get('tab') as
    | 'quizzes'
    | 'badges'
    | 'leaderboard'
    | 'progress'
    | null;
  const [activeTab, setActiveTab] = useState<'quizzes' | 'badges' | 'leaderboard' | 'progress'>(
    tabFromUrl && ['quizzes', 'badges', 'leaderboard', 'progress'].includes(tabFromUrl)
      ? tabFromUrl
      : 'quizzes'
  );

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);

  // Refresh user profile when badges tab is opened to show newly earned badges
  useEffect(() => {
    if (activeTab === 'badges' && user?.id) {
      loadUserProfile();
    }
  }, [activeTab, user?.id, loadUserProfile]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showBadgeShowcase, setShowBadgeShowcase] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);

  useEffect(() => {
    console.log('[Gamification] useEffect triggered', {
      user: user?.id,
      selectedSubject,
      selectedDifficulty,
    });

    if (!user) {
      console.warn('[Gamification] No user found, skipping data load');
      return;
    }

    console.log('[Gamification] Starting data load...');
    let isMounted = true;

    const loadData = async () => {
      try {
        if (!isMounted) return;

        console.log('[Gamification] Loading user profile...');
        await loadUserProfile();
        if (!isMounted) return;
        console.log('[Gamification] User profile loaded');

        console.log('[Gamification] Loading user progress...');
        await loadUserProgress();
        if (!isMounted) return;
        console.log('[Gamification] User progress loaded');

        console.log('[Gamification] Loading available badges...');
        await loadAvailableBadges();
        if (!isMounted) return;
        console.log('[Gamification] Available badges loaded');

        console.log('[Gamification] Loading quizzes...', {
          subject: selectedSubject,
          difficulty: selectedDifficulty,
        });
        await loadQuizzes(selectedSubject || undefined, selectedDifficulty || undefined);
        if (!isMounted) return;
        console.log('[Gamification] Quizzes loaded');
      } catch (error) {
        console.error('[Gamification] Error loading data:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      console.log('[Gamification] useEffect cleanup');
    };
  }, [user?.id, selectedSubject, selectedDifficulty]);

  const handleStartQuiz = async (quizId: string) => {
    console.log('[Gamification] Starting quiz:', quizId);
    try {
      setActiveQuiz(null); // Clear previous quiz
      const quiz = await startQuiz(quizId);
      console.log('[Gamification] Quiz loaded successfully:', quiz.id);
      console.log('[Gamification] Quiz has', quiz.questions?.length || 0, 'questions');

      if (!quiz.questions || quiz.questions.length === 0) {
        console.error('[Gamification] Quiz has no questions!');
        showWarning('This quiz has no questions available. Please try another quiz.');
        return;
      }

      setActiveQuiz(quiz);
    } catch (error) {
      console.error('[Gamification] Failed to start quiz:', error);
      showError(error instanceof Error ? error.message : 'Failed to load quiz. Please try again.');
    }
  };

  const handleQuizComplete = async (attempt: any) => {
    setActiveQuiz(null);

    // Refresh user profile to get latest badges
    await loadUserProfile();

    // Check if user earned any new badges from the backend response
    const newBadges = (attempt.newBadges || []) as any[];

    if (newBadges.length > 0) {
      // Use the first new badge (most recent)
      const earnedBadge = newBadges[0];

      // Transform backend badge format to UserBadge format
      const userBadge = {
        id: earnedBadge.id || `ub_${earnedBadge.badge?.id || 'new'}`,
        userId: user?.id || '',
        badgeId: earnedBadge.badge?.id || earnedBadge.badgeId || '',
        badge: earnedBadge.badge || {
          id: earnedBadge.badgeId || '',
          name: earnedBadge.badge?.name || 'Unknown Badge',
          description: earnedBadge.badge?.description || '',
          icon: earnedBadge.badge?.icon || '🏆',
          category: earnedBadge.badge?.category || ('achievement' as const),
          rarity: earnedBadge.badge?.rarity || ('common' as const),
          criteria: earnedBadge.badge?.criteria || { type: 'quiz_score' as const, threshold: 0 },
          pointsReward: earnedBadge.badge?.pointsReward || 0,
          createdAt: earnedBadge.badge?.createdAt || new Date().toISOString(),
          isActive: earnedBadge.badge?.isActive !== false,
        },
        earnedAt: earnedBadge.earnedAt || new Date().toISOString(),
      };

      setNewBadge(userBadge);
      setShowBadgeShowcase(true);
    }
  };

  const handleQuizExit = () => {
    setActiveQuiz(null);
  };

  const subjects =
    Array.isArray(availableQuizzes) && availableQuizzes.length > 0
      ? [...new Set(availableQuizzes.map((quiz) => quiz?.subject).filter(Boolean))]
      : [];
  const difficulties = ['easy', 'medium', 'hard'];

  console.log('[Gamification] Filter options:', {
    subjects,
    difficulties,
    availableQuizzesCount: availableQuizzes?.length || 0,
    availableQuizzes: availableQuizzes,
    firstQuiz: availableQuizzes?.[0],
  });

  if (error) {
    console.error('[Gamification] Error state:', error);
  }

  if (!user) {
    console.warn('[Gamification] Rendering auth required message');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access gamification features.</p>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    return <QuizTaking quiz={activeQuiz} onComplete={handleQuizComplete} onExit={handleQuizExit} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <strong>Error loading gamification data:</strong>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Summary */}
        {userProfile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <LevelProgress
              currentXP={userProfile.currentXP || 0}
              nextLevelXP={userProfile.nextLevelXP || 100}
              level={userProfile.level || 1}
            />

            {userProfile.streak && (
              <StreakDisplay
                currentStreak={userProfile.streak.currentStreak || 0}
                longestStreak={userProfile.streak.longestStreak || 0}
                isActive={userProfile.streak.isActive || false}
              />
            )}

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl sm:text-2xl text-purple-600">
                    #{userProfile.rank || 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Global Rank</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-base sm:text-lg text-blue-800">
                    {(userProfile.totalPoints || 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 min-w-max">
              {[
                {
                  id: 'quizzes',
                  label: '🧠 Quizzes',
                  count: Array.isArray(availableQuizzes) ? availableQuizzes.length : 0,
                },
                {
                  id: 'badges',
                  label: '🏆 Badges',
                  count: Array.isArray(userProfile?.badges) ? userProfile.badges.length : 0,
                },
                { id: 'leaderboard', label: '🏅 Leaderboard' },
                { id: 'progress', label: '📊 Progress' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-600 py-0.5 px-1.5 sm:px-2 rounded-full text-xs">
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
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 lg:gap-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-2 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full sm:w-auto flex-1 sm:flex-none px-3 sm:px-2 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            {Array.isArray(recentAttempts) && recentAttempts.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  📈 Recent Results
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {recentAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className="card p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          Recent Quiz
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            attempt.percentage >= 80
                              ? 'text-green-600'
                              : attempt.percentage >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {attempt.percentage}%
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">
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
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                🎯 Available Quizzes ({availableQuizzes?.length || 0})
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-4 sm:p-6 animate-pulse">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                      <div className="h-2.5 sm:h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2.5 sm:h-3 bg-gray-200 rounded mb-3 sm:mb-4"></div>
                      <div className="h-8 sm:h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : availableQuizzes && availableQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {availableQuizzes.map((quiz) => {
                    console.log('[Gamification] Rendering quiz card:', quiz.id, quiz.title);
                    return (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onStartQuiz={handleStartQuiz}
                        isLoading={false}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No Quizzes Found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    Try adjusting your filters or check back later for new quizzes.
                  </p>
                  <div className="text-xs sm:text-sm text-gray-500">
                    <p>Debug info:</p>
                    <p>Quizzes count: {availableQuizzes?.length || 0}</p>
                    <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
                    <p>Selected subject: {selectedSubject || 'None'}</p>
                    <p>Selected difficulty: {selectedDifficulty || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                🏆 Your Badges
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Collect badges by completing challenges and reaching milestones!
              </p>
            </div>

            {userProfile?.badges &&
            Array.isArray(userProfile.badges) &&
            userProfile.badges.length > 0 ? (
              <BadgeDisplay
                badges={userProfile.badges}
                showProgress={true}
                size="large"
                layout="grid"
              />
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏆</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Badges Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Start taking quizzes to earn your first badges!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <React.Suspense fallback={<div className="card p-6">Loading leaderboard...</div>}>
              <Leaderboard showCurrentUser={true} maxEntries={10} />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                📊 Your Progress
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Track your learning journey across different subjects.
              </p>
            </div>

            {Array.isArray(subjectProgress) && subjectProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {subjectProgress.map((progress) => (
                  <div key={progress.id} className="card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        📚 {progress.subject}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                        Level {progress.level}
                      </span>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <ProgressBar
                        current={progress.currentXP}
                        max={progress.nextLevelXP}
                        label="XP Progress"
                        color="purple"
                        showValues={true}
                        showPercentage={true}
                      />

                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-blue-600">
                            {progress.completedQuizzes}
                          </div>
                          <div className="text-xs text-gray-500">Quizzes</div>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            {progress.averageScore}%
                          </div>
                          <div className="text-xs text-gray-500">Avg Score</div>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-purple-600">
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
              <div className="text-center py-8 sm:py-12">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Progress Data
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
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
          onClose={async () => {
            setShowBadgeShowcase(false);
            setNewBadge(null);
            // Refresh profile to ensure badge appears in the list
            await loadUserProfile();
            // Switch to badges tab to show the newly earned badge
            setActiveTab('badges');
          }}
        />
      )}
    </DashboardLayout>
  );
};
