import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../../services/chatService';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  role?: string;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const [availableUsers, setAvailableUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createConversation, selectConversation, loadConversations, conversations } =
    useChatStore();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  // Load available users when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      loadAvailableUsers();
    } else {
      // Reset state when modal closes
      setAvailableUsers([]);
      setError(null);
    }
  }, [isOpen, currentUser]);

  const loadAvailableUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all available users based on role
      // Students see tutors, Tutors see students
      const users = await chatService.getAvailableUsers();

      // Filter out current user just to be safe
      const filteredUsers = users.filter((user: SearchUser) => user.id !== currentUser?.id);

      setAvailableUsers(filteredUsers);
    } catch (err) {
      logger.error('Error loading available users', err);
      setError('Failed to load available users. Please try again.');
      setAvailableUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user: SearchUser) => {
    try {
      setIsCreating(true);
      setError(null);

      // Check if conversation already exists
      const currentUserId = currentUser?.id;
      const otherUserId = user.id;

      const existingConversation = conversations.find((conv) => {
        if (conv.type !== 'direct') return false;
        const convParticipantIds = conv.participants.map((p) => p.id);
        return (
          convParticipantIds.length === 2 &&
          convParticipantIds.includes(currentUserId || '') &&
          convParticipantIds.includes(otherUserId)
        );
      });

      if (existingConversation) {
        // Conversation already exists, just select it
        await selectConversation(existingConversation.id);
        onClose();
        navigate('/chat');
        setIsCreating(false);
        return;
      }

      // Create new conversation
      const newConversation = await createConversation([user.id], 'direct');

      // Reload conversations to get the latest list
      await loadConversations();

      // Small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Select the newly created conversation
      await selectConversation(newConversation.id);

      // Close modal
      onClose();

      // Navigate to chat page if not already there
      navigate('/chat');
    } catch (err) {
      logger.error('Error creating chat', err);
      setError(err instanceof Error ? err.message : 'Failed to start chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-opacity-20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Header Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {currentUser?.role === 'STUDENT'
                  ? 'Select a tutor to start a conversation'
                  : 'Select a student to start a conversation'}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray-600">Loading available users...</span>
              </div>
            )}

            {/* Available Users List */}
            {!isLoading && availableUsers.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                  Available {currentUser?.role === 'STUDENT' ? 'Tutors' : 'Students'} (
                  {availableUsers.length})
                </div>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                  {availableUsers.map((user) => {
                    const fullName = `${user.firstName} ${user.lastName}`;
                    const hasExistingChat = conversations.some((conv) => {
                      if (conv.type !== 'direct') return false;
                      const convParticipantIds = conv.participants.map((p) => p.id);
                      return (
                        convParticipantIds.length === 2 &&
                        convParticipantIds.includes(currentUser?.id || '') &&
                        convParticipantIds.includes(user.id)
                      );
                    });

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        disabled={isCreating}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={fullName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-white">
                                  {user.firstName?.[0] || ''}
                                  {user.lastName?.[0] || '?'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {fullName}
                              </h3>
                              {user.role && (
                                <span
                                  className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                                    user.role === 'TUTOR'
                                      ? 'bg-purple-100 text-purple-700'
                                      : user.role === 'PARENT'
                                        ? 'bg-green-100 text-green-700'
                                        : user.role === 'ADMIN'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {user.role}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 truncate">{user.email}</p>

                            {hasExistingChat && (
                              <p className="text-xs text-blue-600 mt-1">Existing conversation</p>
                            )}
                          </div>

                          {/* Arrow Icon */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State - No Users */}
            {!isLoading && availableUsers.length === 0 && (
              <div className="mb-4 p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-gray-400 text-3xl mb-2">👤</div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  No {currentUser?.role === 'STUDENT' ? 'tutors' : 'students'} available
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === 'STUDENT'
                    ? 'There are no tutors available at the moment.'
                    : 'There are no students available at the moment.'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
