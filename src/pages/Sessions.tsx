import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout';
import { Calendar } from '../components/scheduling/Calendar';
import { ScheduleForm } from '../components/scheduling/ScheduleForm';
import { SessionList } from '../components/scheduling/SessionList';
import { TutorBooking } from '../components/scheduling/TutorBooking';
import { SessionStats } from '../components/scheduling/SessionStats';
import { NotificationSettings } from '../components/scheduling/NotificationSettings';
import { useSessionStore } from '../store/sessionStore';
import { Session } from '../services/sessionService';
import {
  Calendar as CalendarIcon,
  PenTool,
  GraduationCap,
  Bell,
  BookOpen,
  PartyPopper,
  CheckCircle2,
} from 'lucide-react';

export const Sessions: React.FC = () => {
  const {
    sessions,
    loadSessions,
    loadSessionStats,
    createSession,
    updateSession,
    deleteSession,
    updateSessionStatus,
    error,
  } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'tutors' | 'settings'>(
    'calendar'
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load all sessions for calendar view (no pagination needed)
    loadSessions({ page: 1, limit: 1000 });
    loadSessionStats();
  }, [loadSessions, loadSessionStats]);

  // Show error if exists
  useEffect(() => {
    if (error) {
      console.error('Session error:', error);
      // You could show a toast notification here
    }
  }, [error]);

  /* Original mock data removed - now using API data
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: '1',
        title: 'Fun with Fractions! 🍕',
        subject: 'Math',
        type: 'tutoring',
        startTime: '2024-01-15T14:00:00Z',
        endTime: '2024-01-15T15:00:00Z',
        tutor: {
          id: 'tutor-1',
          name: 'Teacher Emma',
          avatar: '👩‍🏫'
        },
        status: 'scheduled',
        reminderEnabled: true,
        reminderTime: 15
      },
      {
        id: '2',
        title: 'Reading Adventure Time 📚',
        subject: 'English',
        type: 'study',
        startTime: '2024-01-15T16:00:00Z',
        endTime: '2024-01-15T16:30:00Z',
        status: 'scheduled',
        isRecurring: true,
        recurringPattern: 'daily',
        reminderEnabled: true,
        reminderTime: 10
      },
      {
        id: '3',
        title: 'Science Experiments 🧪',
        subject: 'Science',
        type: 'tutoring',
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T11:00:00Z',
        tutor: {
          id: 'tutor-2',
          name: 'Teacher Mike',
          avatar: '👨‍🔬'
        },
        status: 'scheduled',
        reminderEnabled: true,
        reminderTime: 30
      },
      {
        id: '4',
        title: 'Math Challenge Quiz 🧮',
        subject: 'Math',
        type: 'quiz',
        startTime: '2024-01-14T15:00:00Z',
        endTime: '2024-01-14T15:30:00Z',
        status: 'completed'
      },
      {
        id: '5',
        title: 'Story Writing Workshop ✍️',
        subject: 'English',
        type: 'study',
        startTime: '2024-01-13T14:00:00Z',
        endTime: '2024-01-13T15:00:00Z',
        status: 'missed'
      }
    ];

    setSessions(mockSessions);
  }, []); */

  const handleCreateSession = async (sessionData: Partial<Session>) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      // Calculate duration from startTime and endTime
      let duration: number | undefined;

      if (sessionData.startTime && sessionData.endTime) {
        const start = new Date(sessionData.startTime);
        const end = new Date(sessionData.endTime);
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
      }

      // Map frontend type to backend type
      // Frontend uses 'study', backend expects 'self_study'
      // Also handle other valid types: 'tutoring', 'quiz', 'reading'
      const typeMapping: Record<string, string> = {
        'study': 'self_study',
        'self_study': 'self_study',
        'tutoring': 'tutoring',
        'quiz': 'quiz',
        'reading': 'reading',
      };
      
      const sessionType = typeMapping[sessionData.type || 'study'] || 'self_study';

      // Ensure duration is provided if endTime is not provided
      if (!duration && !sessionData.endTime) {
        duration = 60; // Default to 60 minutes if neither duration nor endTime is provided
      }

      // Ensure subject is provided and valid
      if (!sessionData.subject || sessionData.subject.trim() === '') {
        throw new Error('Please select a subject for the session');
      }

      // Map frontend subject IDs to backend subject names
      const subjectMapping: Record<string, string> = {
        'math': 'Mathematics',
        'reading': 'English',
        'science': 'Science',
        'history': 'History',
        'art': 'Art',
        'music': 'Music',
        'general': 'Mathematics', // Default to Mathematics for general
      };

      // Valid backend subject names
      const validSubjects = [
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
        'Biology', 'History', 'Geography', 'Computer Science',
        'Art', 'Music', 'Spanish', 'French', 'German'
      ];

      // Normalize subject: if already valid, use it; otherwise map it
      const subjectKey = sessionData.subject.toLowerCase();
      let mappedSubject: string;
      
      if (validSubjects.includes(sessionData.subject)) {
        // Already a valid backend subject
        mappedSubject = sessionData.subject;
      } else if (subjectMapping[subjectKey]) {
        // Map from frontend ID to backend name
        mappedSubject = subjectMapping[subjectKey];
      } else {
        // Fallback to Mathematics if no mapping found
        mappedSubject = 'Mathematics';
      }

      await createSession({
        title: sessionData.title || 'New Session',
        subject: mappedSubject,
        type: sessionType as 'self_study' | 'tutoring',
        startTime: sessionData.startTime || new Date().toISOString(),
        endTime: sessionData.endTime,
        duration: duration,
        tutorId: sessionData.tutor?.id,
        reminderEnabled: sessionData.reminderEnabled ?? true,
        reminderTime: sessionData.reminderTime ?? 15,
        isRecurring: sessionData.isRecurring ?? false,
        recurringPattern: sessionData.recurringPattern || undefined, // Convert empty string to undefined
        description: sessionData.description || undefined, // Convert empty string to undefined
      });

      setSuccessMessage('Session created successfully!');
      setShowScheduleForm(false);

      // Reload sessions to show the new one
      await loadSessions({ page: 1, limit: 1000 });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create session. Please try again.';
      setErrorMessage(message);
      console.error('Failed to create session:', error);
    }
  };

  const handleEditSession = async (sessionId: string, updatedData: Partial<Session>) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      // Calculate duration from startTime and endTime if both are provided
      let duration: number | undefined;

      if (updatedData.startTime && updatedData.endTime) {
        const start = new Date(updatedData.startTime);
        const end = new Date(updatedData.endTime);
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
      }

      await updateSession(sessionId, {
        title: updatedData.title,
        subject: updatedData.subject,
        type: updatedData.type,
        startTime: updatedData.startTime,
        endTime: updatedData.endTime,
        duration: duration,
        tutorId: updatedData.tutor?.id,
        reminderEnabled: updatedData.reminderEnabled,
        reminderTime: updatedData.reminderTime,
        isRecurring: updatedData.isRecurring,
        recurringPattern: updatedData.recurringPattern,
        description: updatedData.description,
      });

      setSuccessMessage('Session updated successfully!');
      setEditingSession(null);

      // Reload sessions to show the updated one
      await loadSessions({ page: 1, limit: 1000 });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update session. Please try again.';
      setErrorMessage(message);
      console.error('Failed to update session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      // Reload sessions to reflect the deletion
      await loadSessions({ page: 1, limit: 1000 });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSessionStatusChange = async (sessionId: string, status: Session['status']) => {
    try {
      await updateSessionStatus(sessionId, status);
      // Reload sessions to reflect the status change
      await loadSessions({ page: 1, limit: 1000 });
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  };

  const tabs = [
    {
      id: 'calendar' as const,
      label: 'My Calendar',
      description: 'See all your learning adventures',
      icon: 'calendar',
    },
    {
      id: 'schedule' as const,
      label: 'Plan Sessions',
      description: 'Create your study schedule',
      icon: 'pen',
    },
    {
      id: 'tutors' as const,
      label: 'Book Tutors',
      description: 'Find awesome teachers',
      icon: 'graduation',
    },
    {
      id: 'settings' as const,
      label: 'Reminders',
      description: 'Set up notifications',
      icon: 'bell',
    },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @keyframes calendarPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes penWrite {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-5deg) translateY(-2px); }
        }
        @keyframes graduationBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
          50% { transform: rotate(0deg); }
        }
        @keyframes bookOpen {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.2) translateY(-3px); }
        }
        @keyframes celebration {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(-15deg); }
          50% { transform: scale(1.2) rotate(15deg); }
          75% { transform: scale(1.1) rotate(-10deg); }
        }
      `}</style>
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1 sm:mb-2 flex items-center gap-2">
                My Learning Schedule!
                <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-900 animate-pulse" />
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-amber-700 mb-3 sm:mb-4">
                Plan your awesome learning adventures and meet amazing teachers!
              </p>
            </div>
            <div className="hidden sm:block flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bookOpen"
                  style={{ animation: 'bookOpen 2s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center space-x-3 animate-fadeIn">
            <div className="flex-shrink-0">
              <CheckCircle2
                className="w-6 h-6 text-green-600 animate-bounce-slow"
                style={{ animation: 'bounce 2s ease-in-out infinite' }}
              />
            </div>
            <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
              {successMessage}
              {successMessage.includes('created') && (
                <PartyPopper
                  className="w-4 h-4 text-green-600 animate-celebration"
                  style={{ animation: 'celebration 1.5s ease-in-out infinite' }}
                />
              )}
            </p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center space-x-3 animate-fadeIn">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-red-900">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Session Statistics */}
        <SessionStats sessions={sessions} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-0 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative min-w-0 flex-1 sm:flex-none overflow-hidden py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium text-center hover:bg-purple-50 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-amber-700 hover:text-purple-900'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    {tab.icon === 'calendar' && (
                      <CalendarIcon
                        className="w-5 h-5 sm:w-6 sm:h-6 animate-calendarPulse"
                        style={{ animation: 'calendarPulse 2s ease-in-out infinite' }}
                      />
                    )}
                    {tab.icon === 'pen' && (
                      <PenTool
                        className="w-5 h-5 sm:w-6 sm:h-6 animate-penWrite"
                        style={{ animation: 'penWrite 1.5s ease-in-out infinite' }}
                      />
                    )}
                    {tab.icon === 'graduation' && (
                      <GraduationCap
                        className="w-5 h-5 sm:w-6 sm:h-6 animate-graduationBounce"
                        style={{ animation: 'graduationBounce 2s ease-in-out infinite' }}
                      />
                    )}
                    {tab.icon === 'bell' && (
                      <Bell
                        className="w-5 h-5 sm:w-6 sm:h-6 animate-bellRing"
                        style={{ animation: 'bellRing 2s ease-in-out infinite' }}
                      />
                    )}
                    <span className="font-semibold whitespace-nowrap text-xs sm:text-sm">
                      {tab.label}
                    </span>
                    <span
                      className={`text-xs hidden sm:block ${
                        activeTab === tab.id ? 'text-purple-100' : 'text-amber-600'
                      }`}
                    >
                      {tab.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'calendar' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-bold text-purple-900">
                    Your Learning Calendar
                  </h2>
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    + Add New Session
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <Calendar
                      sessions={sessions}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      onEditSession={(session) => setEditingSession(session)}
                    />
                  </div>
                  <div>
                    <SessionList
                      sessions={sessions.filter((session) => {
                        const sessionDate = new Date(session.startTime).toDateString();
                        return sessionDate === selectedDate.toDateString();
                      })}
                      onEditSession={setEditingSession}
                      onDeleteSession={handleDeleteSession}
                      onStatusChange={handleSessionStatusChange}
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-purple-900">
                  Plan Your Study Sessions
                </h2>
                <ScheduleForm
                  onSubmit={handleCreateSession}
                  editingSession={editingSession}
                  onUpdate={handleEditSession}
                  onCancel={() => setEditingSession(null)}
                />
              </div>
            )}

            {activeTab === 'tutors' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex items-center gap-2">
                  Book Amazing Teachers!
                  <GraduationCap
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-900 animate-graduationBounce"
                    style={{ animation: 'graduationBounce 2s ease-in-out infinite' }}
                  />
                </h2>
                <TutorBooking onBookSession={handleCreateSession} existingSessions={sessions} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex items-center gap-2">
                  Notification Settings
                  <Bell
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-900 animate-bellRing"
                    style={{ animation: 'bellRing 2s ease-in-out infinite' }}
                  />
                </h2>
                <NotificationSettings sessions={sessions} onUpdateSession={handleEditSession} />
              </div>
            )}
          </div>
        </div>

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl my-2 sm:my-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                  Create New Session
                </h3>
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    setErrorMessage(null);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Error Message in Modal */}
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              <ScheduleForm
                onSubmit={handleCreateSession}
                onCancel={() => {
                  setShowScheduleForm(false);
                  setErrorMessage(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {editingSession && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl my-2 sm:my-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                  Edit Session
                </h3>
                <button
                  onClick={() => {
                    setEditingSession(null);
                    setErrorMessage(null);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Error Message in Modal */}
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              <ScheduleForm
                editingSession={editingSession}
                onUpdate={handleEditSession}
                onCancel={() => {
                  setEditingSession(null);
                  setErrorMessage(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
