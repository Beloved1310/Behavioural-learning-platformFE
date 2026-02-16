import React, { useState } from 'react';
import { ChatMessage, User } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { logger } from '../../utils/logger';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  currentUserId?: string;
  currentUser?: User | null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  currentUserId,
  currentUser,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { addReaction, removeReaction, editMessage, deleteMessage } = useChatStore();

  const formatTime = (timestamp: string | undefined | null) => {
    // Handle null/undefined cases
    if (!timestamp) {
      return '--:--';
    }

    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '--:--';
      }

      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Check if hours/minutes are valid numbers
      if (isNaN(hours) || isNaN(minutes)) {
        return '--:--';
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      logger.warn('[MessageBubble.formatTime] Error formatting timestamp', { timestamp, error });
      return '--:--';
    }
  };

  const formatFileSize = (bytes: number | undefined | null) => {
    // Handle null/undefined cases
    if (!bytes || bytes === 0 || isNaN(bytes)) {
      return '0 Bytes';
    }

    try {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      if (isNaN(i) || i < 0) {
        return '0 Bytes';
      }
      const size = Math.round((bytes / Math.pow(1024, i)) * 100) / 100;
      if (isNaN(size)) {
        return '0 Bytes';
      }
      return `${size} ${sizes[i] || 'Bytes'}`;
    } catch (error) {
      logger.warn('[MessageBubble.formatFileSize] Error formatting file size', { bytes, error });
      return 'Unknown size';
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) return;
    const existingReaction = message.reactions?.find(
      (r) => r.userId === currentUserId && r.emoji === emoji
    );

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
                    {!['pdf', 'word', 'excel', 'audio', 'video'].some((type) =>
                      attachment.fileType.includes(type)
                    ) && '📎'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{attachment.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
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

    const reactionCounts = message.reactions.reduce(
      (acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionCounts).map(([emoji, count]) => {
          const hasUserReaction = message.reactions?.some(
            (r) => r.userId === currentUserId && r.emoji === emoji
          );
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
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-2`}>
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-gray-100 rounded-lg px-3 py-2">
            <p className="text-sm text-gray-500 italic">This message was deleted</p>
            <p className="text-xs text-gray-400 mt-1">
              {formatTime(message.timestamp || message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get sender name for display
  const getSenderName = () => {
    if (isOwn) {
      return 'You';
    }

    // Try to get sender name from message object
    if (message.sender) {
      // First try the name field (might be populated directly)
      if (message.sender.name && message.sender.name.trim() && message.sender.name !== 'Unknown User') {
        return message.sender.name.trim();
      }

      // Then try firstName and lastName
      const firstName = message.sender.firstName || '';
      const lastName = message.sender.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }

    // Try to get name from active conversation participants as fallback
    const { activeConversation } = useChatStore.getState();
    if (activeConversation && message.senderId) {
      const senderParticipant = activeConversation.participants.find(
        (p) => p.id === message.senderId
      );
      if (senderParticipant) {
        const firstName = senderParticipant.firstName || '';
        const lastName = senderParticipant.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
          return fullName;
        }
        // Try participant name field
        if (senderParticipant.name && senderParticipant.name.trim()) {
          return senderParticipant.name.trim();
        }
      }
    }

    // Final fallback - try to construct from senderId if it's a name-like string
    if (message.senderId && typeof message.senderId === 'string' && message.senderId.length > 10) {
      // If senderId looks like an ObjectId, don't use it as a name
      return 'Tutor';
    }

    // Last resort fallback
    return 'Tutor';
  };

  // Get avatar for user's own messages
  const getUserAvatar = () => {
    if (isOwn && currentUser) {
      if (currentUser.profileImage) {
        return (
          <img
            src={currentUser.profileImage}
            alt={currentUser.firstName || 'You'}
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      }
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {currentUser.firstName?.[0] || ''}
            {currentUser.lastName?.[0] || '' || 'Y'}
          </span>
        </div>
      );
    }

    // Avatar for other users (receiver)
    if (message.sender?.profileImage) {
      return (
        <img
          src={message.sender.profileImage}
          alt={getSenderName()}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    // Fallback avatar for other users
    const senderName = getSenderName();
    const initials =
      senderName && senderName !== 'Tutor' && senderName !== 'You'
        ? `${senderName.split(' ')[0]?.[0] || ''}${senderName.split(' ')[1]?.[0] || ''}`.toUpperCase() ||
          senderName[0]?.toUpperCase() || 'T'
        : senderName === 'Tutor' ? 'T' : '?';

    return (
      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-white">{initials}</span>
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-2 group`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {/* Avatar */}
        {showAvatar && <div className="flex-shrink-0 self-end mb-1">{getUserAvatar()}</div>}

        {/* Spacer when avatar is not shown */}
        {!showAvatar && <div className="w-8 flex-shrink-0"></div>}

        {/* Message bubble */}
        <div className="flex-1">
          {/* Sender name for receiver messages */}
          {!isOwn && showAvatar && (
            <div className="mb-1 px-1">
              <span className="text-xs font-medium text-gray-600">{getSenderName()}</span>
            </div>
          )}

          <div
            className={`rounded-lg px-3 py-2 ${
              isOwn ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
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
                      setEditContent(message.content || '');
                    }}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{message.content || '(No content)'}</p>
                {renderAttachments()}
              </>
            )}
          </div>

          {/* Timestamp below message - WhatsApp style */}
          <div className={`flex items-center mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
              {formatTime(message.timestamp || message.createdAt)}
            </span>
            {message.isEdited && (
              <span className={`text-xs ml-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                (edited)
              </span>
            )}
          </div>

          {renderReactions()}

          {/* Message actions - hidden by default, show on hover */}
          <div
            className={`flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
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
