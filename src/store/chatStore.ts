import { create } from 'zustand';
import {
  ChatState,
  Conversation,
  ChatMessage,
  OnlineStatus,
  TypingIndicator,
  ChatReport,
  MessageAttachment,
} from '../types';
import { socketService } from '../services/socketService';
import { chatService } from '../services/chatService';
import { useAuthStore } from './authStore';
import { logger } from '../utils/logger';

interface ChatStore extends ChatState {
  // Pagination state
  conversationsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;

  // Socket connection management
  initializeSocket: (token?: string) => void;
  disconnectSocket: () => void;

  // Conversation management
  loadConversations: (page?: number, limit?: number) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (
    participants: string[],
    type?: 'direct' | 'group',
    name?: string
  ) => Promise<Conversation>;
  archiveConversation: (conversationId: string) => Promise<void>;
  muteConversation: (conversationId: string, muted: boolean) => Promise<void>;

  // Message management
  sendMessage: (conversationId: string, content: string, attachments?: File[]) => Promise<void>;
  loadMessages: (conversationId: string, limit?: number, offset?: number) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;

  // Real-time features
  setTyping: (conversationId: string, isTyping: boolean) => void;
  updateOnlineStatus: (userId: string, status: OnlineStatus['status']) => void;
  handleNewMessage: (message: ChatMessage) => void;
  handleTypingIndicator: (indicator: TypingIndicator) => void;
  handleUserOnlineStatus: (status: OnlineStatus) => void;
  handleStopTyping: (data: { userId: string; conversationId: string }) => void;
  handleMessageDeleted: (data: { messageId: string; conversationId: string }) => void;
  handleMessageEdited: (data: {
    messageId: string;
    content: string;
    conversationId: string;
  }) => void;

  // File handling
  uploadFile: (file: File) => Promise<MessageAttachment>;

  // Safety features
  reportConversation: (
    conversationId: string,
    reason: ChatReport['reason'],
    description: string,
    messageId?: string
  ) => Promise<void>;

  // Utility functions
  clearError: () => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  onlineUsers: [],
  typingIndicators: [],
  isLoading: false,
  error: null,
  conversationsPagination: null,

  initializeSocket: (token?: string) => {
    // Connect to socket
    socketService.connect(token);

    // Register event handlers
    socketService.on('new_message', (message: ChatMessage) => {
      get().handleNewMessage(message);
    });

    socketService.on('user_online_status', (status: OnlineStatus) => {
      get().handleUserOnlineStatus(status);
    });

    socketService.on('user_typing', (indicator: TypingIndicator) => {
      get().handleTypingIndicator(indicator);
    });

    socketService.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
      get().handleStopTyping(data);
    });

    socketService.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
      get().handleMessageDeleted(data);
    });

    socketService.on(
      'message_edited',
      (data: { messageId: string; content: string; conversationId: string }) => {
        get().handleMessageEdited(data);
      }
    );

    socketService.on('connected', () => {
      logger.debug('Socket connected - updating status to online');
      socketService.updateStatus('online');
    });

    socketService.on('error', (error: Error) => {
      logger.error('Socket error', error);
      set({ error: error.message });
    });
  },

  disconnectSocket: () => {
    socketService.updateStatus('offline');
    socketService.disconnect();
  },

  loadConversations: async (page = 1, limit = 20, search?: string) => {
    // Check if token exists before making API call
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({
        isLoading: false,
        error: 'Authentication required. Please log in again.',
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      logger.debug('Loading conversations', { search, page, limit });
      const result = await chatService.getConversations({ search, page, limit });

      // Sort conversations by lastActivity (most recent first)
      const sortedConversations = [...result.conversations].sort((a, b) => {
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bTime - aTime; // Descending order (most recent first)
      });

      logger.debug('Conversations loaded', { count: sortedConversations.length });

      set({
        conversations: sortedConversations,
        conversationsPagination: result.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Error loading conversations', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversations',
      });
    }
  },

  selectConversation: async (conversationId: string) => {
    const { conversations, loadMessages, activeConversation, loadConversations } = get();

    logger.debug('Selecting conversation', { conversationId });
    logger.debug(
      `[ChatStore.selectConversation] Current conversations count: ${conversations.length}`
    );

    // Leave previous chat if there was one
    if (activeConversation) {
        logger.debug('Leaving previous chat', { chatId: activeConversation.id });
      socketService.leaveChat(activeConversation.id);
    }

    let conversation = conversations.find((c) => c.id === conversationId);
    logger.debug('Conversation found in list', { conversationId, found: !!conversation });

    // If conversation not found in list, try to fetch it
    if (!conversation) {
      try {
        // First, try refreshing the conversations list (conversation might have just been created)
        await loadConversations();
        const { conversations: refreshedConversations } = get();
        conversation = refreshedConversations.find((c) => c.id === conversationId);

        // If still not found, fetch the full conversation details from backend
        if (!conversation) {
          logger.debug('Conversation not in list, fetching from backend', { conversationId });
          try {
            // Fetch full conversation details from backend
            conversation = await chatService.getConversationById(conversationId);

            // Add it to the conversations list if it doesn't exist
            const { conversations: currentConversations } = get();
            const exists = currentConversations.find((c) => c.id === conversationId);
            if (!exists && conversation) {
              set({ conversations: [conversation, ...currentConversations] });
            }
          } catch (fetchError) {
            logger.error('Failed to fetch conversation from backend', fetchError);
            // Only create minimal object as last resort
            conversation = {
              id: conversationId,
              type: 'direct' as const,
              participants: [],
              unreadCount: 0,
              isArchived: false,
              isMuted: false,
              createdAt: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            };
            // Add it to the conversations list
            const { conversations: currentConversations } = get();
            set({ conversations: [conversation, ...currentConversations] });
          }
        }
      } catch (error) {
        logger.error('Failed to fetch conversation', error);
        // Try to fetch from backend as fallback
        try {
          conversation = await chatService.getConversationById(conversationId);
          const { conversations: currentConversations } = get();
          const exists = currentConversations.find((c) => c.id === conversationId);
          if (!exists && conversation) {
            set({ conversations: [conversation, ...currentConversations] });
          }
        } catch (fetchError) {
          logger.error('Failed to fetch conversation from backend', fetchError);
          // Only create minimal object as absolute last resort
          if (conversationId) {
            conversation = {
              id: conversationId,
              type: 'direct' as const,
              participants: [],
              unreadCount: 0,
              isArchived: false,
              isMuted: false,
              createdAt: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            };
            set({ conversations: [conversation, ...conversations] });
          } else {
            return;
          }
        }
      }
    }

    if (conversation) {
      // Ensure conversation has all required fields before setting as active
      const normalizedConversation: Conversation = {
        ...conversation,
        id: conversation.id,
        type: conversation.type || 'direct',
        participants: conversation.participants || [],
        unreadCount: conversation.unreadCount || 0,
        isArchived: conversation.isArchived || false,
        isMuted: conversation.isMuted || false,
        createdAt: conversation.createdAt || new Date().toISOString(),
        lastActivity:
          conversation.lastActivity || conversation.updatedAt || new Date().toISOString(),
      };

      set({ activeConversation: normalizedConversation });

      // Join the new chat room via socket
      socketService.joinChat(conversationId);

      // Load messages for this conversation
      await loadMessages(conversationId);
    }
  },

  createConversation: async (participants: string[], type = 'direct', name?: string) => {
    set({ isLoading: true, error: null });

    try {
      // Use getOrCreateChat to get existing chat or create a new one
      // This handles both new and existing chats properly
      const newConversation = await chatService.getOrCreateChat({
        participants,
        type,
        name,
      });

      // Ensure conversation has all required fields
      const normalizedConversation: Conversation = {
        ...newConversation,
        id: newConversation.id,
        type: newConversation.type || type,
        participants: newConversation.participants || [],
        unreadCount: newConversation.unreadCount || 0,
        isArchived: newConversation.isArchived || false,
        isMuted: newConversation.isMuted || false,
        createdAt: newConversation.createdAt || new Date().toISOString(),
        lastActivity:
          newConversation.lastActivity || newConversation.updatedAt || new Date().toISOString(),
      };

      const { conversations, activeConversation } = get();

      // Leave previous chat if there was one
      if (activeConversation) {
        socketService.leaveChat(activeConversation.id);
      }

      // Check if conversation already exists in the list to avoid duplicates
      const existingIndex = conversations.findIndex((c) => c.id === normalizedConversation.id);
      if (existingIndex === -1) {
        set({
          conversations: [normalizedConversation, ...conversations],
          activeConversation: normalizedConversation, // Automatically set as active
          isLoading: false,
        });
      } else {
        // Update existing conversation
        const updatedConversations = [...conversations];
        updatedConversations[existingIndex] = normalizedConversation;
        set({
          conversations: updatedConversations,
          activeConversation: normalizedConversation, // Automatically set as active
          isLoading: false,
        });
      }

      // Join the new chat room via socket
      socketService.joinChat(normalizedConversation.id);

      // Load messages for this conversation (load from the beginning)
      logger.debug('Loading messages for conversation', { conversationId: normalizedConversation.id });
      await get().loadMessages(normalizedConversation.id, 50, 0);
      logger.debug('Messages loaded for conversation', { conversationId: normalizedConversation.id });

      return normalizedConversation;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create conversation',
      });
      throw error;
    }
  },

  loadMessages: async (conversationId: string, limit = 50, offset = 0) => {
    logger.debug('Loading messages', { conversationId, limit, offset });
    set({ isLoading: true, error: null });

    try {
      const loadedMessages = await chatService.getMessages(conversationId, limit, offset);
      logger.debug('Messages loaded from API', { count: loadedMessages.length });

      const { messages } = get();
      // Preserve existing messages and append new ones, or replace if loading from start
      const existingMessages = offset === 0 ? [] : messages[conversationId] || [];
      const currentCount = existingMessages.length;

      // Messages are returned in chronological order (oldest first) from backend
      // When offset is 0, we're loading the initial messages, so replace all
      // When offset > 0, we're loading older messages, so prepend them
      const updatedMessages =
        offset === 0 ? loadedMessages : [...loadedMessages, ...existingMessages];

      logger.debug('Message count updated', { before: currentCount, after: updatedMessages.length });

      set({
        messages: {
          ...messages,
          [conversationId]: updatedMessages,
        },
        isLoading: false,
      });

      logger.debug('Messages loaded successfully', { conversationId });
    } catch (error) {
      logger.error('Error loading messages', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages',
      });
    }
  },

  sendMessage: async (conversationId: string, content: string, attachments?: File[]) => {
    try {
      // Get current user from auth store
      const { user } = useAuthStore.getState();
      const currentUserId = user?.id || '';

      let messageAttachments: MessageAttachment[] = [];
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        messageAttachments = await Promise.all(
          attachments.map((file) => chatService.uploadFile(file))
        );
        // Use first attachment for socket message
        if (messageAttachments.length > 0) {
          fileUrl = messageAttachments[0].url;
          fileName = messageAttachments[0].name;
        }
      }

      // Create optimistic message for immediate UI update
      const tempMessageId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: ChatMessage = {
        id: tempMessageId,
        conversationId: conversationId,
        senderId: currentUserId,
        sender: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              name: `${user.firstName} ${user.lastName}`,
              profileImage: user.profileImage || null,
              role: user.role,
            }
          : {
              id: currentUserId,
              firstName: '',
              lastName: '',
              name: '',
              profileImage: null,
              role: 'TUTOR',
            },
        type: attachments && attachments.length > 0 ? 'FILE' : 'TEXT',
        content: content,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        isRead: true,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Add optimistic message to store immediately
      const { messages, conversations, activeConversation } = get();
      const conversationMessages = messages[conversationId] || [];

      // Optimistic message added silently

      set({
        messages: {
          ...messages,
          [conversationId]: [...conversationMessages, optimisticMessage],
        },
        conversations: conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, lastMessage: optimisticMessage, lastActivity: optimisticMessage.timestamp }
            : conv
        ),
      });

      // Update active conversation if it's the current one
      if (activeConversation?.id === conversationId) {
        set({
          activeConversation: {
            ...activeConversation,
            lastMessage: optimisticMessage,
            lastActivity: optimisticMessage.timestamp,
          },
        });
      }

      // Send message via WebSocket for instant delivery (primary method)
      // IMPORTANT: Only send via ONE method to avoid duplicates
      if (socketService.isConnected()) {
        logger.debug('Sending via WebSocket', { conversationId, contentPreview: content.substring(0, 50) });
        // Ensure we're in the chat room before sending
        socketService.joinChat(conversationId);
        socketService.sendMessage(conversationId, content, messageAttachments);
        // NOTE: WebSocket handler will create message in DB and broadcast it
        // The optimistic message will be replaced when we receive the 'new_message' event
        // DO NOT also send via HTTP API - that causes duplicates!
      } else {
        logger.debug('WebSocket not connected, sending via HTTP API', { conversationId });
        // Fallback to HTTP API if WebSocket is not connected
        const newMessage = await chatService.sendMessage({
          conversationId,
          content,
          messageType: attachments && attachments.length > 0 ? 'document' : 'text',
          attachments: messageAttachments,
        });

        logger.debug('HTTP API response received', { messageId: newMessage.id });

        // Replace optimistic message with real message
        const { messages: currentMessages } = get();
        const updatedMessages = { ...currentMessages };
        const msgIndex = updatedMessages[conversationId]?.findIndex(
          (msg) => msg.id === tempMessageId
        );

        if (msgIndex !== undefined && msgIndex !== -1) {
          updatedMessages[conversationId][msgIndex] = newMessage;
        } else {
          // If optimistic message wasn't found, just add the real message
          const conversationMessages = updatedMessages[conversationId] || [];
          const messageExists = conversationMessages.some((msg) => msg.id === newMessage.id);
          if (!messageExists) {
            updatedMessages[conversationId] = [...conversationMessages, newMessage];
          }
        }

        set({
          messages: updatedMessages,
          conversations: conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: newMessage,
                  lastActivity: newMessage.timestamp || newMessage.createdAt,
                }
              : conv
          ),
        });
      }
    } catch (error) {
      logger.error('Error sending message', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
      throw error;
    }
  },

  editMessage: async (messageId: string, newContent: string) => {
    try {
      const updatedMessage = await chatService.editMessage(messageId, { content: newContent });

      const { messages } = get();
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach((conversationId) => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) =>
          msg.id === messageId ? updatedMessage : msg
        );
      });

      set({ messages: updatedMessages });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to edit message',
      });
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);

      const { messages } = get();
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach((conversationId) => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true, content: 'Message deleted' } : msg
        );
      });

      set({ messages: updatedMessages });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete message',
      });
      throw error;
    }
  },

  addReaction: async (messageId: string, emoji: string) => {
    try {
      await chatService.addReaction(messageId, emoji);

      const { messages } = get();
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach((conversationId) => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existingReaction = reactions.find((r) => r.emoji === emoji);

            if (!existingReaction) {
              reactions.push({
                id: Date.now().toString(),
                userId: get().activeConversation?.participants[0]?.id || '',
                emoji,
                timestamp: new Date().toISOString(),
              });
            }

            return { ...msg, reactions };
          }
          return msg;
        });
      });

      set({ messages: updatedMessages });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add reaction',
      });
      throw error;
    }
  },

  removeReaction: async (messageId: string, emoji: string) => {
    try {
      const { messages } = get();
      let reactionId: string | undefined;

      // Find the reaction ID for the given emoji on the message
      Object.keys(messages).forEach((conversationId) => {
        const message = messages[conversationId].find((msg) => msg.id === messageId);
        if (message) {
          const reaction = message.reactions?.find((r) => r.emoji === emoji);
          if (reaction) {
            reactionId = reaction.id;
          }
        }
      });

      if (!reactionId) {
        throw new Error('Reaction not found');
      }

      await chatService.removeReaction(messageId, reactionId);

      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach((conversationId) => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) => {
          if (msg.id === messageId) {
            const reactions = (msg.reactions || []).filter((r) => r.id !== reactionId);
            return { ...msg, reactions };
          }
          return msg;
        });
      });

      set({ messages: updatedMessages });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove reaction',
      });
      throw error;
    }
  },

  archiveConversation: async (conversationId: string) => {
    try {
      await chatService.archiveConversation(conversationId, true);

      const { conversations } = get();
      set({
        conversations: conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, isArchived: true } : conv
        ),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive conversation',
      });
      throw error;
    }
  },

  muteConversation: async (conversationId: string, muted: boolean) => {
    try {
      await chatService.muteConversation(conversationId, muted);

      const { conversations } = get();
      set({
        conversations: conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, isMuted: muted } : conv
        ),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mute conversation',
      });
      throw error;
    }
  },

  setTyping: (conversationId: string, isTyping: boolean) => {
    if (isTyping) {
      socketService.sendTyping(conversationId);
    } else {
      socketService.sendStopTyping(conversationId);
    }
  },

  updateOnlineStatus: (userId: string, status: OnlineStatus['status']) => {
    // Update own status via socket
    socketService.updateStatus(status);

    // Update local state
    const { onlineUsers } = get();
    const updatedUsers = onlineUsers.filter((user) => user.userId !== userId);

    updatedUsers.push({
      userId,
      status,
      lastSeen: new Date().toISOString(),
    });

    set({ onlineUsers: updatedUsers });
  },

  handleNewMessage: (message: ChatMessage) => {
    const { messages, conversations, activeConversation } = get();

    logger.debug('Received new message', {
      messageId: message?.id,
      conversationId: message?.conversationId || (message as any)?.chatId,
      contentPreview: message?.content?.substring(0, 50),
    });

    // Validate message has required fields
    if (!message || !message.id || !message.content) {
      logger.warn('Invalid message received - missing required fields', { message });
      return;
    }

    // Normalize conversationId - handle both chatId and conversationId
    const conversationId = message.conversationId || (message as any).chatId;
    if (!conversationId) {
      logger.warn('Missing conversationId/chatId in message', { message });
      return;
    }

    // Normalize message format first - ensure all required fields exist
    const normalizedMessage: ChatMessage = {
      id: message.id,
      conversationId: conversationId,
      senderId:
        typeof message.senderId === 'string' ? message.senderId : String(message.senderId || ''),
      sender: message.sender || {
        id:
          typeof message.senderId === 'string' ? message.senderId : String(message.senderId || ''),
        firstName: '',
        lastName: '',
        name: '',
        profileImage: null,
        role: '',
      },
      type: message.type || 'TEXT',
      content: message.content || '',
      fileUrl: message.fileUrl || null,
      fileName: message.fileName || null,
      isRead: message.isRead || false,
      timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
      createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
    };

    const conversationMessages = messages[conversationId] || [];

    // Check if message already exists (avoid duplicates) - STRICT CHECK
    const existingMessageIndex = conversationMessages.findIndex(
      (msg) => msg.id === normalizedMessage.id
    );
    if (existingMessageIndex !== -1) {
      logger.debug('Duplicate message detected, ignoring', { messageId: normalizedMessage.id, conversationId });
      return;
    }

    // Also check for duplicate by content + sender + timestamp (within 5 seconds) as additional safeguard
    const duplicateByContent = conversationMessages.find(
      (msg) =>
        msg.content === normalizedMessage.content &&
        msg.senderId === normalizedMessage.senderId &&
        Math.abs(
          new Date(msg.timestamp || msg.createdAt).getTime() -
            new Date(normalizedMessage.timestamp).getTime()
        ) < 5000
    );
    if (duplicateByContent) {
      logger.debug('Duplicate message detected by content, ignoring', { conversationId });
      return;
    }

    // Check if there's an optimistic message (temp message) that should be replaced
    const optimisticMessageIndex = conversationMessages.findIndex(
      (msg) =>
        msg.id.startsWith('temp-') &&
        msg.senderId === normalizedMessage.senderId &&
        msg.content === normalizedMessage.content &&
        Math.abs(
          new Date(msg.timestamp).getTime() - new Date(normalizedMessage.timestamp).getTime()
        ) < 10000 // Within 10 seconds
    );

    if (optimisticMessageIndex !== -1) {
      console.log(
        `[ChatStore.handleNewMessage] Replacing optimistic message at index ${optimisticMessageIndex} with real message ${normalizedMessage.id}`
      );
      // Replace optimistic message with real message
      const updatedMessages = [...conversationMessages];
      updatedMessages[optimisticMessageIndex] = normalizedMessage;

      set({
        messages: {
          ...messages,
          [conversationId]: updatedMessages,
        },
        conversations: conversations.map((conv) => {
          if (conv.id === conversationId) {
            const unreadIncrement = activeConversation?.id === conversationId ? 0 : 1;
            return {
              ...conv,
              lastMessage: normalizedMessage,
              lastActivity: normalizedMessage.timestamp || normalizedMessage.createdAt,
              unreadCount: conv.unreadCount + unreadIncrement,
            };
          }
          return conv;
        }),
      });

      // Update active conversation if it's the current one
      if (activeConversation?.id === conversationId) {
        set({
          activeConversation: {
            ...activeConversation,
            lastMessage: normalizedMessage,
            lastActivity: normalizedMessage.timestamp || normalizedMessage.createdAt,
          },
        });
      }
      logger.debug('Optimistic message replaced successfully', { messageId: normalizedMessage.id });
      return;
    }

    // Check if conversation exists in the list
    let conversation = conversations.find((conv) => conv.id === conversationId);

    // If conversation doesn't exist, try to fetch it from backend
    if (!conversation) {
      logger.debug('Conversation not found in list, fetching from backend', { conversationId });
      // Fetch conversation asynchronously (don't block message display)
      chatService
        .getConversationById(conversationId)
        .then((fetchedConversation) => {
          const { conversations: currentConversations } = get();
          const exists = currentConversations.find((c) => c.id === conversationId);
          if (!exists && fetchedConversation) {
            set({ conversations: [fetchedConversation, ...currentConversations] });
          }
        })
        .catch((error) => {
          logger.error('Failed to fetch conversation for new message', error, { conversationId });
        });
    }

    // Add message to store
    logger.debug('Adding new message to store', { messageId: normalizedMessage.id, conversationId });

    set({
      messages: {
        ...messages,
        [conversationId]: [...conversationMessages, normalizedMessage],
      },
      conversations: conversations.map((conv) => {
        if (conv.id === conversationId) {
          // Only increment unread count if this is not the active conversation
          const unreadIncrement = activeConversation?.id === conversationId ? 0 : 1;
          return {
            ...conv,
            lastMessage: normalizedMessage,
            lastActivity: normalizedMessage.timestamp || normalizedMessage.createdAt,
            unreadCount: conv.unreadCount + unreadIncrement,
          };
        }
        return conv;
      }),
    });

    // Update active conversation if it's the current one
    if (activeConversation?.id === conversationId) {
      set({
        activeConversation: {
          ...activeConversation,
          lastMessage: normalizedMessage,
          lastActivity: normalizedMessage.timestamp || normalizedMessage.createdAt,
        },
      });
    }

    logger.debug('Message added successfully', {
      conversationId,
      messageCount: (messages[conversationId] || []).length + 1,
    });
  },

  handleTypingIndicator: (indicator: TypingIndicator) => {
    const { typingIndicators } = get();
    const filtered = typingIndicators.filter(
      (t) => t.userId !== indicator.userId || t.conversationId !== indicator.conversationId
    );

    set({ typingIndicators: [...filtered, indicator] });

    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      const { typingIndicators: currentIndicators } = get();
      set({
        typingIndicators: currentIndicators.filter(
          (t) => t.userId !== indicator.userId || t.conversationId !== indicator.conversationId
        ),
      });
    }, 3000);
  },

  handleUserOnlineStatus: (status: OnlineStatus) => {
    const { onlineUsers } = get();
    const updatedUsers = onlineUsers.filter((user) => user.userId !== status.userId);
    updatedUsers.push(status);

    set({ onlineUsers: updatedUsers });
  },

  uploadFile: async (file: File) => {
    try {
      const attachment = await chatService.uploadFile(file);
      return attachment;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload file',
      });
      throw error;
    }
  },

  reportConversation: async (
    conversationId: string,
    reason: ChatReport['reason'],
    description: string,
    messageId?: string
  ) => {
    try {
      await chatService.reportConversation({ conversationId, reason, description, messageId });

      logger.info('Report submitted successfully', {
        conversationId,
        reason,
        description,
        messageId,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit report',
      });
      throw error;
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      // Mark as read via API
      await chatService.markAsRead(conversationId);

      // Also send via socket for real-time updates
      socketService.markAsRead(conversationId);

      const { conversations } = get();
      set({
        conversations: conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      });
    } catch (error) {
      logger.error('Failed to mark as read', error);
    }
  },

  handleStopTyping: (data: { userId: string; conversationId: string }) => {
    const { typingIndicators } = get();
    set({
      typingIndicators: typingIndicators.filter(
        (t) => !(t.userId === data.userId && t.conversationId === data.conversationId)
      ),
    });
  },

  handleMessageDeleted: (data: { messageId: string; conversationId: string }) => {
    const { messages } = get();
    const conversationMessages = messages[data.conversationId] || [];

    set({
      messages: {
        ...messages,
        [data.conversationId]: conversationMessages.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true, content: 'Message deleted' } : msg
        ),
      },
    });
  },

  handleMessageEdited: (data: { messageId: string; content: string; conversationId: string }) => {
    const { messages } = get();
    const conversationMessages = messages[data.conversationId] || [];

    set({
      messages: {
        ...messages,
        [data.conversationId]: conversationMessages.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.content, isEdited: true, editedAt: new Date().toISOString() }
            : msg
        ),
      },
    });
  },

  clearError: () => set({ error: null }),
}));
