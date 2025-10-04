import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { ReportDialog } from './ReportDialog';
import { Button } from '../ui/Button';

export const ChatWindow: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    activeConversation,
    messages,
    typingIndicators,
    onlineUsers,
    sendMessage,
    setTyping,
    markAsRead,
    isLoading
  } = useChatStore();

  const conversationMessages = activeConversation 
    ? messages[activeConversation.id] || []
    : [];

  const currentUserId = '1'; // This would come from auth context

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!activeConversation) return;
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    try {
      await sendMessage(activeConversation.id, trimmedMessage, selectedFiles);
      setMessage('');
      setSelectedFiles([]);
      setShowFileUpload(false);
      
      // Stop typing indicator
      if (isTyping) {
        setTyping(activeConversation.id, false);
        setIsTyping(false);
      }
      
      // Focus back on input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
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
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getOnlineStatus = (userId: string) => {
    const userStatus = onlineUsers.find(user => user.userId === userId);
    return userStatus?.status || 'offline';
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation to start chatting
          </h3>
          <p className="text-sm text-gray-600">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    );
  }

  const otherParticipants = activeConversation.participants.filter(
    p => p.id !== currentUserId
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {otherParticipants.slice(0, 2).map((participant) => {
                const status = getOnlineStatus(participant.id);
                return (
                  <div key={participant.id} className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-sm font-medium text-gray-600">
                        {participant.firstName[0]}{participant.lastName[0]}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      status === 'online' ? 'bg-green-400' :
                      status === 'away' ? 'bg-yellow-400' :
                      status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                  </div>
                );
              })}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">
                {activeConversation.title || 
                 otherParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {otherParticipants.map((participant, index) => {
                  const status = getOnlineStatus(participant.id);
                  const userStatus = onlineUsers.find(u => u.userId === participant.id);
                  
                  return (
                    <span key={participant.id}>
                      {status === 'online' ? 'Online' : 
                       status === 'away' ? 'Away' :
                       status === 'busy' ? 'Busy' :
                       userStatus ? formatLastSeen(userStatus.lastSeen) : 'Offline'}
                      {index < otherParticipants.length - 1 && ' • '}
                    </span>
                  );
                })}
                {activeConversation.metadata?.subject && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">{activeConversation.metadata.subject}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReportDialog(true)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Report conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && conversationMessages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-gray-600">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversationMessages.map((msg, index) => {
              const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId;
              
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                  showAvatar={showAvatar}
                />
              );
            })}
            
            <TypingIndicator 
              indicators={typingIndicators} 
              conversationId={activeConversation.id} 
            />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
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
              <div key={index} className="flex items-center justify-between bg-white rounded p-2 border">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="border-t border-gray-200 p-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`p-2 rounded-full transition-colors ${
              showFileUpload 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Attach files"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() && selectedFiles.length === 0}
            size="md"
            className="px-4 py-2"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        conversationId={activeConversation.id}
        reportedUserName={otherParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
      />
    </div>
  );
};