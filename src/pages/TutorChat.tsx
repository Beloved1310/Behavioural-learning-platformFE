import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft } from 'lucide-react';

export const TutorChat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    updateOnlineStatus,
    initializeSocket,
    disconnectSocket,
    loadConversations,
    selectConversation,
  } = useChatStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      initializeSocket(token || undefined);
      updateOnlineStatus(user.id, 'online');
      loadConversations();

      // Check if there's a student or conversation in URL params
      const studentId = searchParams.get('student');
      const conversationId = searchParams.get('conversation');

      if (conversationId) {
        selectConversation(conversationId);
      } else if (studentId) {
        setSelectedStudentId(studentId);
        // Find or create conversation with this student
        // For MVP, we'll just select if it exists
      }

      return () => {
        updateOnlineStatus(user.id, 'offline');
        disconnectSocket();
      };
    }
  }, [
    user,
    initializeSocket,
    updateOnlineStatus,
    disconnectSocket,
    loadConversations,
    selectConversation,
    searchParams,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user) {
        if (document.hidden) {
          updateOnlineStatus(user.id, 'away');
        } else {
          updateOnlineStatus(user.id, 'online');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, updateOnlineStatus]);

  if (!user) {
    return (
      <TutorLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access the chat feature.</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="h-screen flex flex-col">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium truncate">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div
          className="flex-1 flex flex-col lg:flex-row"
          style={{
            height: 'calc(100vh - 3.5rem)',
            minHeight: '500px',
            backgroundColor: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </TutorLayout>
  );
};
