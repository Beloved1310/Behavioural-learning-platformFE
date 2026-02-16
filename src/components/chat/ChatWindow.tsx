import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { ReportDialog } from './ReportDialog';
import { logger } from '../../utils/logger';

export const ChatWindow: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    activeConversation,
    messages,
    typingIndicators,
    sendMessage,
    setTyping,
    markAsRead,
    isLoading,
  } = useChatStore();

  const conversationMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id || '';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  // Mark conversation as read when it becomes active
  useEffect(() => {
    if (activeConversation && activeConversation.unreadCount > 0) {
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, markAsRead]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (activeConversation) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        messageInputRef.current?.focus();
        // Ensure input is enabled
        if (messageInputRef.current) {
          messageInputRef.current.disabled = false;
        }
      }, 100);
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!activeConversation) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    // Store original values for potential rollback
    const originalMessage = message;
    const originalFiles = [...selectedFiles];

    // Clear input immediately for better UX (optimistic update)
    setMessage('');
    setSelectedFiles([]);
    setShowFileUpload(false);

    try {
      await sendMessage(activeConversation.id, trimmedMessage, originalFiles);

      // Stop typing indicator
      if (isTyping) {
        setTyping(activeConversation.id, false);
        setIsTyping(false);
      }

      // Scroll to bottom after message is sent
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      logger.error('Failed to send message', error);
      // Restore message if sending failed
      setMessage(originalMessage);
      setSelectedFiles(originalFiles);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!activeConversation) return;

    // Handle typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      setTyping(activeConversation.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(activeConversation.id, false);
      }
    }, 2000);
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Always show the input area, even when no conversation is selected
  // This ensures the input is always visible

  const otherParticipants = activeConversation
    ? activeConversation.participants.filter((p) => p.id !== currentUserId)
    : [];

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        height: '100%',
        backgroundColor: '#ffffff',
        minWidth: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chat Header - WhatsApp style with light blue background */}
      {activeConversation && (
        <div className="flex-shrink-0" style={{ backgroundColor: '#0084ff' }}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Back button */}
            <button
              onClick={() => window.history.back()}
              className="flex-shrink-0 p-2 -ml-2 text-white hover:bg-blue-600 rounded-full transition-colors"
              title="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Contact name - centered */}
            <div className="flex-1 text-center">
              <h3 className="text-lg font-semibold text-white">
                {activeConversation.title ||
                  otherParticipants
                    .map((p) => {
                      // Try name field first
                      if (p.name && p.name.trim() && p.name !== 'Unknown User') {
                        return p.name.trim();
                      }
                      // Then try firstName and lastName
                      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
                      if (fullName) {
                        return fullName;
                      }
                      // Fallback based on role
                      return p.role === 'TUTOR' ? 'Tutor' : 'User';
                    })
                    .join(', ')}
              </h3>
            </div>

            {/* Profile/Info button */}
            <button
              onClick={() => setShowReportDialog(true)}
              className="flex-shrink-0 p-2 -mr-2 text-white hover:bg-blue-600 rounded-full transition-colors"
              title="Contact info"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Empty State - Show when no conversation is selected */}
      {!activeConversation && (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a conversation to start chatting
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose from your existing conversations or start a new one
            </p>
            <p className="text-xs text-gray-500">Click the + button to start a new conversation</p>
          </div>
        </div>
      )}

      {/* Messages Area - WhatsApp style with white background */}
      {activeConversation && (
        <div
          className="flex-1 overflow-y-auto px-2 py-4 min-h-0"
          style={{ backgroundColor: '#ffffff' }}
        >
          {isLoading && conversationMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : conversationMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-gray-600">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {conversationMessages.map((msg, index) => {
                const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
                // Show avatar if it's the first message, or if sender changed, or if more than 5 minutes passed
                const showAvatar =
                  !prevMessage ||
                  prevMessage.senderId !== msg.senderId ||
                  (prevMessage.timestamp &&
                    msg.timestamp &&
                    new Date(msg.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() >
                      5 * 60 * 1000);

                // Ensure message has required fields before rendering
                if (!msg || !msg.id) {
                  logger.warn('[ChatWindow] Invalid message in list', msg);
                  return null;
                }

                // Handle missing content gracefully
                if (!msg.content && !msg.fileUrl && !msg.fileName) {
                  logger.warn('[ChatWindow] Message has no content', msg);
                  // Still render it, but with a placeholder
                }

                return (
                  <MessageBubble
                    key={msg.id || `msg-${index}`}
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                    showAvatar={showAvatar}
                    currentUserId={currentUserId}
                    currentUser={currentUser}
                  />
                );
              })}

              <TypingIndicator
                key={`typing-${activeConversation.id}`}
                indicators={typingIndicators}
                conversationId={activeConversation.id}
              />
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded p-2 border"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📎</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
          />
        </div>
      )}

      {/* Message Input - WhatsApp style white input bar at bottom - Always visible */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-3 py-2 z-20 relative">
        <div className="flex items-center space-x-2">
          {/* Attachment Button - Only show when conversation is active */}
          {activeConversation && (
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors"
              title="Attach files"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          )}

          {/* Message Input - WhatsApp style rounded input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                activeConversation
                  ? 'Type your message...'
                  : 'Select a conversation to start chatting'
              }
              disabled={!activeConversation}
              readOnly={!activeConversation}
              className={`w-full resize-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                activeConversation
                  ? 'bg-gray-100 focus:bg-white text-gray-900 cursor-text'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                fontSize: '15px',
                lineHeight: '1.4',
                color: activeConversation ? '#111827' : '#9CA3AF',
                opacity: activeConversation ? 1 : 0.6,
              }}
            />
          </div>

          {/* Send Button - Blue paper airplane icon - Only show when conversation is active */}
          {activeConversation && (
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() && selectedFiles.length === 0}
              className={`flex-shrink-0 p-2.5 rounded-full transition-colors ${
                message.trim() || selectedFiles.length > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Report Dialog - Only show if conversation is selected */}
      {activeConversation && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          conversationId={activeConversation.id}
          reportedUserName={otherParticipants
            .map((p) => {
              // Try name field first
              if (p.name && p.name.trim() && p.name !== 'Unknown User') {
                return p.name.trim();
              }
              // Then try firstName and lastName
              const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
              if (fullName) {
                return fullName;
              }
              // Fallback based on role
              return p.role === 'TUTOR' ? 'Tutor' : 'User';
            })
            .join(', ')}
        />
      )}
    </div>
  );
};
