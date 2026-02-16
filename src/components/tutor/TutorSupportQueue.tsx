import React, { useState, useEffect } from 'react';
import { tutorStudentsService, AtRiskStudent } from '../../services/tutorStudentsService';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare } from 'lucide-react';

export const TutorSupportQueue: React.FC = () => {
  const navigate = useNavigate();
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAtRiskStudents();
  }, []);

  const loadAtRiskStudents = async () => {
    try {
      setLoading(true);
      const data = await tutorStudentsService.getAtRiskStudents();
      setAtRiskStudents(data);
    } catch (error) {
      console.error('Failed to load at-risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-red-900 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Students Needing Support</span>
        </h3>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
          {atRiskStudents.length} students
        </span>
      </div>

      {atRiskStudents.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-gray-600">All students are doing well! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atRiskStudents.map((student) => (
            <div key={student.id} className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{student.name}</h4>
                  <div className="mt-1 space-y-1">
                    {student.reasons.map((reason, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(student.priority)}`}
                >
                  {student.priority}
                </span>
              </div>

              <button
                onClick={() => navigate(`/tutor/chat?student=${student.id}`)}
                className="w-full bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 text-sm font-medium flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
