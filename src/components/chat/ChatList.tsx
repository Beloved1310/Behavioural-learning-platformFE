import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Conversation } from '../../types';

export const ChatList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  
  const {
    conversations,
    activeConversation,
    onlineUsers,
    loadConversations,
    selectConversation,
    archiveConversation,
    muteConversation,
    isLoading
  } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter((conversation) => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const participantNames = conversation.participants
        .map(p => `${p.firstName} ${p.lastName}`.toLowerCase())
        .some(name => name.includes(searchLower));
      
      const titleMatch = conversation.title?.toLowerCase().includes(searchLower);
      const lastMessageMatch = conversation.lastMessage?.content.toLowerCase().includes(searchLower);
      
      if (!participantNames && !titleMatch && !lastMessageMatch) {
        return false;
      }
    }

    // Filter by type
    switch (filter) {
      case 'unread':
        return conversation.unreadCount > 0;
      case 'archived':
        return conversation.isArchived;
      default:
        return !conversation.isArchived;
    }
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    const diffInDays = Math.floor(diffInMinutes / 1440);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOnlineStatus = (userId: string) => {
    const userStatus = onlineUsers.find(user => user.userId === userId);
    return userStatus?.status || 'offline';
  };

  const handleConversationClick = (conversation: Conversation) => {
    selectConversation(conversation.id);
  };

  const handleArchiveConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to archive this conversation?')) {
      archiveConversation(conversationId);
    }
  };

  const handleMuteConversation = (e: React.MouseEvent, conversationId: string, isMuted: boolean) => {
    e.stopPropagation();
    muteConversation(conversationId, !isMuted);
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => console.log('New conversation')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="New conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'unread'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              filter === 'archived'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading conversations...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <div className="text-gray-400 text-2xl mb-2">💬</div>
            <p className="text-sm text-gray-500 text-center">
              {searchTerm ? 'No conversations match your search' :
               filter === 'unread' ? 'No unread conversations' :
               filter === 'archived' ? 'No archived conversations' :
               'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const currentUserId = '1'; // This would come from auth context
              const otherParticipants = conversation.participants.filter(
                p => p.id !== currentUserId
              );
              
              const isOnline = otherParticipants.some(p => 
                getOnlineStatus(p.id) === 'online'
              );

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group ${
                    isActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {otherParticipants.length > 0
                            ? `${otherParticipants[0].firstName[0]}${otherParticipants[0].lastName[0]}`
                            : '?'
                          }
                        </span>
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.title || 
                           otherParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.isMuted && (
                            <span className="text-gray-400">🔇</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastActivity)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage ? (
                            <>
                              {conversation.lastMessage.senderId === currentUserId && 'You: '}
                              {conversation.lastMessage.messageType === 'text' 
                                ? truncateMessage(conversation.lastMessage.content)
                                : `📎 ${conversation.lastMessage.messageType === 'image' ? 'Image' : 
                                        conversation.lastMessage.messageType === 'document' ? 'Document' :
                                        'File'}`
                              }
                            </>
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                        
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Conversation metadata */}
                      {conversation.metadata?.subject && (
                        <div className="mt-1">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            {conversation.metadata.subject}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={(e) => handleMuteConversation(e, conversation.id, conversation.isMuted)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title={conversation.isMuted ? 'Unmute' : 'Mute'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {conversation.isMuted ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              )}
                            </svg>
                          </button>
                          
                          {!conversation.isArchived && (
                            <button
                              onClick={(e) => handleArchiveConversation(e, conversation.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="Archive"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};