import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { useSessionStore } from '../store/sessionStore';
import { Session } from '../types';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react';

export const TutorSessionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { selectedSession, getSessionById, isLoading, error, setSelectedSession } =
    useSessionStore();
  const [session, setSession] = useState<Session | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Clear previous session when sessionId changes
    setSession(null);
    setLocalError(null);
    setSelectedSession(null);

    if (sessionId) {
      getSessionById(sessionId).catch((err) => {
        console.error('Failed to load session:', err);
        setLocalError(err instanceof Error ? err.message : 'Failed to load session');
      });
    }
  }, [sessionId, getSessionById, setSelectedSession]);

  useEffect(() => {
    if (selectedSession) {
      setSession(selectedSession);
      setLocalError(null);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <TutorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  if (!session && !isLoading) {
    return (
      <TutorLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">{localError || 'Session not found'}</p>
            {localError && (
              <p className="text-sm text-gray-500 mb-4">
                The session may not exist or you may not have permission to view it.
              </p>
            )}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="mt-4 text-purple-600 hover:text-purple-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // For MVP, we'll assume parent approval is shown via status
  // In a full implementation, there would be a parentApproval field
  const parentApproved = session.status === 'scheduled' || session.status === 'confirmed';

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tutor/dashboard')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Session Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 truncate">
                {session.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{formatDate(session.startTime)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{session.duration} minutes</span>
                </span>
              </div>
            </div>
            <div
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                session.status === 'scheduled' || session.status === 'confirmed'
                  ? 'bg-blue-100 text-blue-700'
                  : session.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : session.status === 'cancelled' || session.status === 'missed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
              }`}
            >
              {session.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span>Student Information</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Student Name</div>
                  <div className="font-semibold text-gray-900">
                    {session.tutor?.name || 'Student'}
                  </div>
                </div>
                {/* Age would come from student data if available */}
                <div>
                  <div className="text-sm text-gray-600">Subject</div>
                  <div className="font-semibold text-gray-900">{session.subject}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Session Type</div>
                  <div className="font-semibold text-gray-900 capitalize">{session.type}</div>
                </div>
              </div>
            </div>

            {/* Session Description/Notes */}
            {(session.description || session.notes) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Session Details</span>
                </h2>
                {session.description && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Description</div>
                    <div className="text-gray-900">{session.description}</div>
                  </div>
                )}
                {session.notes && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Notes</div>
                    <div className="text-gray-900">{session.notes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Parent Approval Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent Approval</h2>
              <div className="flex items-center space-x-3">
                {parentApproved ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-700">Approved</div>
                      <div className="text-sm text-gray-600">Parent has approved this session</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="font-semibold text-orange-700">Pending Approval</div>
                      <div className="text-sm text-gray-600">Waiting for parent approval</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => navigate(`/tutor/chat?student=${session.userId}`)}
                  className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm sm:text-base"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900">Open Chat</span>
                </button>

                {(session.status === 'scheduled' || session.status === 'confirmed') && (
                  <button
                    onClick={() => {
                      // For MVP, this would start the session
                      // In full implementation, this would initiate video call
                      navigate(`/tutor/chat?student=${session.userId}&session=${session.id}`);
                    }}
                    className="w-full flex items-center justify-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">Start Session</span>
                  </button>
                )}
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Date & Time</div>
                  <div className="font-semibold text-gray-900">{formatDate(session.startTime)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-900">{session.duration} minutes</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {session.status.replace('_', ' ')}
                  </div>
                </div>
                {session.meetingUrl && (
                  <div>
                    <div className="text-gray-600">Meeting Link</div>
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
};
