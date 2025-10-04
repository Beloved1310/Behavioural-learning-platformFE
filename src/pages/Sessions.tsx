import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout';
import { Calendar } from '../components/scheduling/Calendar';
import { ScheduleForm } from '../components/scheduling/ScheduleForm';
import { SessionList } from '../components/scheduling/SessionList';
import { TutorBooking } from '../components/scheduling/TutorBooking';
import { SessionStats } from '../components/scheduling/SessionStats';
import { NotificationSettings } from '../components/scheduling/NotificationSettings';

interface Session {
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  tutor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled?: boolean;
  reminderTime?: number; // minutes before session
  description?: string;
}

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'tutors' | 'settings'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  useEffect(() => {
    // Mock data for sessions - replace with API calls
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
  }, []);

  const handleCreateSession = (sessionData: Partial<Session>) => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionData.title || 'New Session',
      subject: sessionData.subject || 'General',
      type: sessionData.type || 'study',
      startTime: sessionData.startTime || new Date().toISOString(),
      endTime: sessionData.endTime || new Date().toISOString(),
      status: 'scheduled',
      reminderEnabled: sessionData.reminderEnabled ?? true,
      reminderTime: sessionData.reminderTime ?? 15,
      isRecurring: sessionData.isRecurring ?? false,
      recurringPattern: sessionData.recurringPattern,
      description: sessionData.description
    };

    setSessions([...sessions, newSession]);
    setShowScheduleForm(false);
  };

  const handleEditSession = (sessionId: string, updatedData: Partial<Session>) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, ...updatedData } : session
    ));
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  const handleSessionStatusChange = (sessionId: string, status: Session['status']) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, status } : session
    ));
  };

  const tabs = [
    {
      id: 'calendar' as const,
      label: 'My Calendar 📅',
      description: 'See all your learning adventures',
      icon: '📅'
    },
    {
      id: 'schedule' as const,
      label: 'Plan Sessions 📝',
      description: 'Create your study schedule',
      icon: '📝'
    },
    {
      id: 'tutors' as const,
      label: 'Book Tutors 👨‍🏫',
      description: 'Find awesome teachers',
      icon: '👨‍🏫'
    },
    {
      id: 'settings' as const,
      label: 'Reminders ⏰',
      description: 'Set up notifications',
      icon: '⏰'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 rounded-2xl p-6 sm:p-8 border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">
                My Learning Schedule! 🗓️
              </h1>
              <p className="text-lg text-amber-700 mb-4">
                Plan your awesome learning adventures and meet amazing teachers!
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">📚</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session Statistics */}
        <SessionStats sessions={sessions} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center hover:bg-purple-50 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-amber-700 hover:text-purple-900'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="font-semibold">{tab.label}</span>
                    <span className={`text-xs ${
                      activeTab === tab.id ? 'text-purple-100' : 'text-amber-600'
                    }`}>
                      {tab.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-purple-900">Your Learning Calendar</h2>
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    + Add New Session
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Calendar
                      sessions={sessions}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      onEditSession={setEditingSession}
                    />
                  </div>
                  <div>
                    <SessionList
                      sessions={sessions.filter(session => {
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
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-purple-900">Plan Your Study Sessions</h2>
                <ScheduleForm
                  onSubmit={handleCreateSession}
                  editingSession={editingSession}
                  onUpdate={handleEditSession}
                  onCancel={() => setEditingSession(null)}
                />
              </div>
            )}

            {activeTab === 'tutors' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-purple-900">Book Amazing Teachers! 👨‍🏫</h2>
                <TutorBooking
                  onBookSession={handleCreateSession}
                  existingSessions={sessions}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-purple-900">Notification Settings ⏰</h2>
                <NotificationSettings
                  sessions={sessions}
                  onUpdateSession={handleEditSession}
                />
              </div>
            )}
          </div>
        </div>

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-900">Create New Session</h3>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ScheduleForm
                onSubmit={handleCreateSession}
                onCancel={() => setShowScheduleForm(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {editingSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-900">Edit Session</h3>
                <button
                  onClick={() => setEditingSession(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ScheduleForm
                editingSession={editingSession}
                onUpdate={handleEditSession}
                onCancel={() => setEditingSession(null)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};