import React, { useEffect } from 'react';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { DashboardLayout } from '../components/layout/MainLayout';

export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { updateOnlineStatus, initializeSocket, disconnectSocket, loadConversations } =
    useChatStore();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const token = localStorage.getItem('accessToken');
      initializeSocket(token || undefined);

      // Set user as online when they visit the chat page
      updateOnlineStatus(user.id, 'online');

      // Load existing conversations when chat screen opens
      loadConversations().catch((error) => {
        console.error('Failed to load conversations:', error);
      });

      // Cleanup function
      return () => {
        // Set user as offline when they leave the chat page
        updateOnlineStatus(user.id, 'offline');
        // Disconnect socket
        disconnectSocket();
      };
    }
  }, [user, updateOnlineStatus, initializeSocket, disconnectSocket, loadConversations]);

  // Handle visibility change to update online status
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div
        className="w-full flex flex-col lg:flex-row"
        style={{
          margin: '-1rem -0.75rem',
          padding: '0',
          height: 'calc(100vh - 5rem)',
          minHeight: '500px',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ChatList />
        <ChatWindow />
      </div>
    </DashboardLayout>
  );
};
