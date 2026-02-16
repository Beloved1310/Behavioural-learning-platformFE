import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { milestonesService, UpcomingMilestone, NewMilestone } from '../services/milestonesService';
import { useAuthStore } from '../store/authStore';
import { Trophy, Target, Calendar, Award, ArrowLeft } from 'lucide-react';

export const Milestones: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<UpcomingMilestone | null>(null);
  const [allMilestones, setAllMilestones] = useState<NewMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMilestones();
    }
  }, [user?.id]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const upcomingData = await milestonesService.getUpcoming();
      setUpcoming(upcomingData);

      const result = await milestonesService.checkMilestones();
      if (result.newMilestones && result.newMilestones.length > 0) {
        setAllMilestones(result.newMilestones);
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Milestones</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Track your achievements and progress
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Milestone */}
        {upcoming && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Next Milestone</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                  {upcoming.type === 'goal' ? upcoming.goalTitle : `${upcoming.target}-Day Streak`}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {upcoming.type === 'goal'
                    ? 'Complete your goal to unlock this milestone!'
                    : 'Maintain your study streak to achieve this milestone!'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {Math.round((upcoming.current / upcoming.target) * 100)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {upcoming.current}/{upcoming.target}
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (upcoming.current / upcoming.target) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* All Milestones */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Milestones</h2>
          </div>

          {allMilestones.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No Milestones Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Keep working on your goals to unlock milestones!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 font-medium text-sm sm:text-base"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {allMilestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <div className="text-2xl sm:text-3xl flex-shrink-0">
                      {milestone.icon || '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-gray-600">{milestone.type}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">
                    {milestone.description}
                  </p>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="capitalize">{milestone.type} Milestone</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State if no upcoming milestone */}
        {!upcoming && allMilestones.length === 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100 text-center">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Start Your Journey!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              Complete quizzes, attend sessions, and achieve your goals to unlock amazing
              milestones!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/gamification')}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 font-medium text-sm sm:text-base"
              >
                Take a Quiz
              </button>
              <button
                onClick={() => navigate('/sessions')}
                className="bg-purple-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-purple-600 font-medium text-sm sm:text-base"
              >
                Book a Session
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
