import React, { useState } from 'react';
import { ChatMessage } from '../../types';
import { useChatStore } from '../../store/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { addReaction, removeReaction, editMessage, deleteMessage } = useChatStore();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleReaction = async (emoji: string) => {
    const existingReaction = message.reactions?.find(r => r.userId === '1' && r.emoji === emoji);
    
    if (existingReaction) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleEdit = async () => {
    if (editContent.trim() !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message.id);
    }
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment) => (
          <div key={attachment.id} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {attachment.fileType.startsWith('image/') ? (
                  <img 
                    src={attachment.thumbnailUrl || attachment.fileUrl} 
                    alt={attachment.fileName}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    {attachment.fileType.includes('pdf') && '📄'}
                    {attachment.fileType.includes('word') && '📝'}
                    {attachment.fileType.includes('excel') && '📊'}
                    {attachment.fileType.includes('audio') && '🎵'}
                    {attachment.fileType.includes('video') && '🎥'}
                    {!['pdf', 'word', 'excel', 'audio', 'video'].some(type => 
                      attachment.fileType.includes(type)) && '📎'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <a 
                href={attachment.fileUrl}
                download={attachment.fileName}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = message.reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionCounts).map(([emoji, count]) => {
          const hasUserReaction = message.reactions?.some(r => r.userId === '1' && r.emoji === emoji);
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                hasUserReaction 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-500 italic">This message was deleted</p>
            <p className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className="flex max-w-xs lg:max-w-md space-x-2">
        {!isOwn && showAvatar && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {message.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          {!isOwn && showAvatar && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-gray-600">
                {message.senderName}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                message.senderRole === 'TUTOR' ? 'bg-purple-100 text-purple-800' :
                message.senderRole === 'PARENT' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {message.senderRole.toLowerCase()}
              </span>
            </div>
          )}
          
          <div className={`rounded-lg px-4 py-2 ${
            isOwn 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            {editMode ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditContent(message.content);
                    }}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {renderAttachments()}
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
              {message.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            
            {/* Message actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="text-xs text-gray-500 hover:text-gray-700 p-1"
                title="Add reaction"
              >
                😊
              </button>
              
              {isOwn && !editMode && (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-xs text-gray-500 hover:text-gray-700 p-1"
                    title="Edit message"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gray-500 hover:text-red-600 p-1"
                    title="Delete message"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
          
          {renderReactions()}
          
          {/* Reaction picker */}
          {showReactions && (
            <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-md">
              <div className="flex space-x-1">
                {['👍', '❤️', '😄', '😮', '😢', '😡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-lg hover:bg-gray-100 p-1 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};