import React, { useState, useEffect, useRef } from 'react';
import { tutorStudentsService, StudentProgress } from '../../services/tutorStudentsService';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Flame,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TutorStudentProgressCard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [students]);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const result = await tutorStudentsService.getAllStudentsProgress();
      setStudents(result.students || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'border-green-200 bg-green-50';
      case 'needs-attention':
        return 'border-yellow-200 bg-yellow-50';
      case 'at-risk':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            🟢 On Track
          </span>
        );
      case 'needs-attention':
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            🟡 Needs Attention
          </span>
        );
      case 'at-risk':
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">🔴 At Risk</span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-80 h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .student-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .student-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>My Students</span>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{students.length} students</span>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No students found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="student-scroll-container flex gap-4 overflow-x-auto scroll-smooth pb-4"
            >
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`flex-shrink-0 w-80 p-4 rounded-xl border-2 ${getStatusColor(student.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{student.name}</h4>
                    {getStatusBadge(student.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <Flame className="w-4 h-4" />
                        <span>Streak</span>
                      </span>
                      <span className="font-bold">{student.streak} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>Goals</span>
                      </span>
                      <span className="font-bold">{student.goalProgress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commitments</span>
                      </span>
                      <span className="font-bold">
                        {student.commitmentsCompleted}/{student.commitmentsTotal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Consistency</span>
                      </span>
                      <span className="font-bold">{student.consistencyScore}%</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/tutor/chat?student=${student.id}`)}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 text-xs font-medium"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => navigate(`/tutor/students/${student.id}`)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 text-xs"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
