import React, { useEffect } from 'react';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { DashboardLayout, MainLayout } from '../components/layout/MainLayout';

export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { updateOnlineStatus, handleUserOnlineStatus } = useChatStore();

  useEffect(() => {
    if (user) {
      // Set user as online when they visit the chat page
      updateOnlineStatus(user.id, 'online');

      // Mock WebSocket connection for real-time features
      // In a real application, you would connect to a WebSocket server here
      const mockWebSocketConnection = () => {
        console.log('Chat WebSocket connection established');
        
        // Simulate receiving online status updates
        const mockOnlineUsers = [
          { userId: '2', status: 'online' as const, lastSeen: new Date().toISOString() },
          { userId: '3', status: 'away' as const, lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
        ];

        mockOnlineUsers.forEach(status => {
          handleUserOnlineStatus(status);
        });
      };

      const connectionTimeout = setTimeout(mockWebSocketConnection, 1000);

      // Cleanup function
      return () => {
        clearTimeout(connectionTimeout);
        // Set user as offline when they leave the chat page
        updateOnlineStatus(user.id, 'offline');
      };
    }
  }, [user, updateOnlineStatus, handleUserOnlineStatus]);

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access the chat feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="h-full flex flex-col lg:flex-row">
          <ChatList />
          <ChatWindow />
        </div>
      </div>
    </DashboardLayout>
  );
};