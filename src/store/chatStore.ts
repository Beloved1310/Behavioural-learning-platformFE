import { create } from 'zustand';
import { ChatState, Conversation, ChatMessage, OnlineStatus, TypingIndicator, ChatReport, MessageAttachment } from '../types';

interface ChatStore extends ChatState {
  // Conversation management
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (participants: string[], type?: 'direct' | 'group') => Promise<Conversation>;
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
  
  // File handling
  uploadFile: (file: File) => Promise<MessageAttachment>;
  
  // Safety features
  reportConversation: (conversationId: string, reason: ChatReport['reason'], description: string, messageId?: string) => Promise<void>;
  
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

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const conversations = await ChatService.getConversations();
      
      // Mock data for development
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participants: [
            {
              id: '2',
              email: 'tutor@example.com',
              firstName: 'Sarah',
              lastName: 'Johnson',
              role: 'TUTOR' as const,
              subscriptionTier: 'PREMIUM' as const,
              isVerified: true,
              createdAt: new Date().toISOString()
            }
          ],
          type: 'direct',
          lastMessage: {
            id: 'm1',
            conversationId: '1',
            senderId: '2',
            senderName: 'Sarah Johnson',
            senderRole: 'TUTOR' as const,
            content: 'Great progress on your math homework! Keep it up.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            messageType: 'text',
            isEdited: false,
            isDeleted: false
          },
          lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          unreadCount: 2,
          isArchived: false,
          isMuted: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          metadata: {
            subject: 'Mathematics',
            groupType: 'tutoring'
          }
        },
        {
          id: '2',
          participants: [
            {
              id: '3',
              email: 'parent@example.com',
              firstName: 'Michael',
              lastName: 'Smith',
              role: 'PARENT' as const,
              subscriptionTier: 'BASIC' as const,
              isVerified: true,
              createdAt: new Date().toISOString()
            }
          ],
          type: 'direct',
          lastMessage: {
            id: 'm2',
            conversationId: '2',
            senderId: '3',
            senderName: 'Michael Smith',
            senderRole: 'PARENT' as const,
            content: 'How was today\'s study session?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            messageType: 'text',
            isEdited: false,
            isDeleted: false
          },
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          unreadCount: 0,
          isArchived: false,
          isMuted: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
        }
      ];

      set({ 
        conversations: mockConversations, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load conversations' 
      });
    }
  },

  selectConversation: async (conversationId: string) => {
    const { conversations, loadMessages } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      set({ activeConversation: conversation });
      await loadMessages(conversationId);
    }
  },

  createConversation: async (participants: string[], type = 'direct') => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const conversation = await ChatService.createConversation(participants, type);
      
      // Mock conversation creation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        participants: [], // Would be populated with actual user data
        type,
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        createdAt: new Date().toISOString()
      };

      const { conversations } = get();
      set({ 
        conversations: [newConversation, ...conversations], 
        isLoading: false 
      });
      
      return newConversation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create conversation' 
      });
      throw error;
    }
  },

  loadMessages: async (conversationId: string, limit = 50, offset = 0) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API call
      // const messages = await ChatService.getMessages(conversationId, limit, offset);
      
      // Mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: 'm1',
          conversationId,
          senderId: '2',
          senderName: 'Sarah Johnson',
          senderRole: 'TUTOR' as const,
          content: 'Hi! I\'ve reviewed your algebra homework. You\'ve made great progress!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          messageType: 'text',
          isEdited: false,
          isDeleted: false
        },
        {
          id: 'm2',
          conversationId,
          senderId: '1',
          senderName: 'You',
          senderRole: 'STUDENT' as const,
          content: 'Thank you! I found the quadratic equations challenging.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          messageType: 'text',
          isEdited: false,
          isDeleted: false
        },
        {
          id: 'm3',
          conversationId,
          senderId: '2',
          senderName: 'Sarah Johnson',
          senderRole: 'TUTOR' as const,
          content: 'That\'s completely normal! Let me share some practice problems.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          messageType: 'text',
          attachments: [
            {
              id: 'a1',
              fileName: 'algebra_practice.pdf',
              fileSize: 245760,
              fileType: 'application/pdf',
              fileUrl: '/mock/algebra_practice.pdf',
              uploadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            }
          ],
          isEdited: false,
          isDeleted: false
        }
      ];

      const { messages } = get();
      set({ 
        messages: { 
          ...messages, 
          [conversationId]: mockMessages 
        }, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load messages' 
      });
    }
  },

  sendMessage: async (conversationId: string, content: string, attachments?: File[]) => {
    try {
      let messageAttachments: MessageAttachment[] = [];
      
      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        const { uploadFile } = get();
        messageAttachments = await Promise.all(
          attachments.map(file => uploadFile(file))
        );
      }

      // TODO: Replace with real API call
      // const message = await ChatService.sendMessage(conversationId, content, messageAttachments);
      
      // Mock message sending
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        conversationId,
        senderId: '1', // Current user ID
        senderName: 'You',
        senderRole: 'STUDENT' as const,
        content,
        timestamp: new Date().toISOString(),
        messageType: attachments && attachments.length > 0 ? 'document' : 'text',
        attachments: messageAttachments,
        isEdited: false,
        isDeleted: false
      };

      // Add message to store
      const { messages, conversations } = get();
      const conversationMessages = messages[conversationId] || [];
      
      set({
        messages: {
          ...messages,
          [conversationId]: [...conversationMessages, newMessage]
        },
        conversations: conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: newMessage, lastActivity: newMessage.timestamp }
            : conv
        )
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      });
      throw error;
    }
  },

  editMessage: async (messageId: string, newContent: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.editMessage(messageId, newContent);
      
      const { messages } = get();
      const updatedMessages = { ...messages };
      
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          msg.id === messageId 
            ? { ...msg, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
            : msg
        );
      });
      
      set({ messages: updatedMessages });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to edit message' 
      });
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.deleteMessage(messageId);
      
      const { messages } = get();
      const updatedMessages = { ...messages };
      
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          msg.id === messageId 
            ? { ...msg, isDeleted: true, content: 'Message deleted' }
            : msg
        );
      });
      
      set({ messages: updatedMessages });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete message' 
      });
      throw error;
    }
  },

  addReaction: async (messageId: string, emoji: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.addReaction(messageId, emoji);
      
      const { messages } = get();
      const updatedMessages = { ...messages };
      
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existingReaction = reactions.find(r => r.userId === '1' && r.emoji === emoji);
            
            if (!existingReaction) {
              reactions.push({
                id: Date.now().toString(),
                userId: '1',
                emoji,
                timestamp: new Date().toISOString()
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
        error: error instanceof Error ? error.message : 'Failed to add reaction' 
      });
    }
  },

  removeReaction: async (messageId: string, emoji: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.removeReaction(messageId, emoji);
      
      const { messages } = get();
      const updatedMessages = { ...messages };
      
      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => {
          if (msg.id === messageId) {
            const reactions = (msg.reactions || []).filter(r => 
              !(r.userId === '1' && r.emoji === emoji)
            );
            return { ...msg, reactions };
          }
          return msg;
        });
      });
      
      set({ messages: updatedMessages });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove reaction' 
      });
    }
  },

  archiveConversation: async (conversationId: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.archiveConversation(conversationId);
      
      const { conversations } = get();
      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId ? { ...conv, isArchived: true } : conv
        )
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to archive conversation' 
      });
    }
  },

  muteConversation: async (conversationId: string, muted: boolean) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.muteConversation(conversationId, muted);
      
      const { conversations } = get();
      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId ? { ...conv, isMuted: muted } : conv
        )
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mute conversation' 
      });
    }
  },

  setTyping: (conversationId: string, isTyping: boolean) => {
    // TODO: Implement WebSocket typing indicator
    console.log(`User typing in ${conversationId}: ${isTyping}`);
  },

  updateOnlineStatus: (userId: string, status: OnlineStatus['status']) => {
    const { onlineUsers } = get();
    const updatedUsers = onlineUsers.filter(user => user.userId !== userId);
    
    updatedUsers.push({
      userId,
      status,
      lastSeen: new Date().toISOString()
    });
    
    set({ onlineUsers: updatedUsers });
  },

  handleNewMessage: (message: ChatMessage) => {
    const { messages, conversations } = get();
    const conversationMessages = messages[message.conversationId] || [];
    
    set({
      messages: {
        ...messages,
        [message.conversationId]: [...conversationMessages, message]
      },
      conversations: conversations.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, lastActivity: message.timestamp, unreadCount: conv.unreadCount + 1 }
          : conv
      )
    });
  },

  handleTypingIndicator: (indicator: TypingIndicator) => {
    const { typingIndicators } = get();
    const filtered = typingIndicators.filter(t => 
      t.userId !== indicator.userId || t.conversationId !== indicator.conversationId
    );
    
    set({ typingIndicators: [...filtered, indicator] });
    
    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      const { typingIndicators: currentIndicators } = get();
      set({
        typingIndicators: currentIndicators.filter(t => 
          t.userId !== indicator.userId || t.conversationId !== indicator.conversationId
        )
      });
    }, 3000);
  },

  handleUserOnlineStatus: (status: OnlineStatus) => {
    const { onlineUsers } = get();
    const updatedUsers = onlineUsers.filter(user => user.userId !== status.userId);
    updatedUsers.push(status);
    
    set({ onlineUsers: updatedUsers });
  },

  uploadFile: async (file: File) => {
    try {
      // TODO: Replace with real file upload service
      // const uploadResult = await FileService.uploadFile(file);
      
      // Mock file upload
      const mockAttachment: MessageAttachment = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: `/mock/${file.name}`,
        uploadedAt: new Date().toISOString()
      };
      
      // If it's an image, create a thumbnail
      if (file.type.startsWith('image/')) {
        mockAttachment.thumbnailUrl = `/mock/thumb_${file.name}`;
      }
      
      return mockAttachment;
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  },

  reportConversation: async (conversationId: string, reason: ChatReport['reason'], description: string, messageId?: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.reportConversation({ conversationId, reason, description, messageId });
      
      // Mock report submission
      console.log('Report submitted:', { conversationId, reason, description, messageId });
      
      // You might want to show a success message to the user
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit report' 
      });
      throw error;
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      // TODO: Replace with real API call
      // await ChatService.markAsRead(conversationId);
      
      const { conversations } = get();
      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  clearError: () => set({ error: null })
}));