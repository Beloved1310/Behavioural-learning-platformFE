import React, { useState, useEffect } from 'react';
import {
  milestonesService,
  UpcomingMilestone,
  NewMilestone,
} from '../../services/milestonesService';
import { useAuthStore } from '../../store/authStore';
import { Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MilestoneCard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<UpcomingMilestone | null>(null);
  const [newMilestones, setNewMilestones] = useState<NewMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebratedMilestone, setCelebratedMilestone] = useState<NewMilestone | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMilestones();
      checkNewMilestones();
    }
  }, [user?.id]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const data = await milestonesService.getUpcoming();
      setUpcoming(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNewMilestones = async () => {
    try {
      const result = await milestonesService.checkMilestones();
      if (result.hasNewMilestones && result.newMilestones.length > 0) {
        setNewMilestones(result.newMilestones);
        // Show celebration for first milestone
        setCelebratedMilestone(result.newMilestones[0]);
      }
    } catch (error) {
      console.error('Failed to check milestones:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Milestones</span>
          </h3>
          <button
            onClick={() => navigate('/milestones')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>

        {upcoming ? (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Next Milestone</h4>
                <p className="text-sm text-gray-600">
                  {upcoming.type === 'goal' ? upcoming.goalTitle : `${upcoming.target}-Day Streak`}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-bold text-orange-600">
                  {upcoming.current}/{upcoming.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (upcoming.current / upcoming.target) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 mb-4">
            <span className="text-4xl mb-2 block">🎯</span>
            <p className="text-gray-600 text-sm">Keep going to unlock milestones!</p>
          </div>
        )}

        {newMilestones.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Recent Achievements</h5>
            {newMilestones.slice(0, 3).map((milestone, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">{milestone.icon || '🏆'}</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{milestone.title}</h5>
                  <p className="text-xs text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {celebratedMilestone && (
        <MilestoneCelebrationModal
          milestone={celebratedMilestone}
          onClose={() => setCelebratedMilestone(null)}
        />
      )}
    </>
  );
};

const MilestoneCelebrationModal: React.FC<{
  milestone: NewMilestone;
  onClose: () => void;
}> = ({ milestone, onClose }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-bounce-in">
        <div className="text-6xl mb-4 animate-bounce">{milestone.icon || '🎉'}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Milestone Achieved!</h2>
        <p className="text-xl text-gray-700 mb-4">{milestone.title}</p>
        <p className="text-sm text-gray-600 mb-6">{milestone.description}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 font-medium"
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
};
