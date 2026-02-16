import { apiService } from './api';
import { Conversation, ChatMessage, MessageAttachment, ChatReport } from '../types';
import { logger } from '../utils/logger';

export interface ConversationFilters {
  type?: 'direct' | 'group';
  isArchived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateConversationRequest {
  participants: string[];
  type?: 'direct' | 'group';
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  attachments?: MessageAttachment[];
  replyToId?: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface ReactionRequest {
  emoji: string;
}

export interface UploadFileResponse {
  attachment: MessageAttachment;
}

class ChatService {
  private readonly BASE_PATH = '/v1/api/chat';

  /**
   * Get all conversations with optional filters and pagination
   * Backend: GET /chats
   */
  async getConversations(
    filters?: ConversationFilters
  ): Promise<{ conversations: Conversation[]; pagination?: any }> {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.isArchived !== undefined)
      params.append('isArchived', filters.isArchived.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${this.BASE_PATH}/chats${queryString ? `?${queryString}` : ''}`;

    // Ensure token is available before making request
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    logger.debug(`[ChatService.getConversations] Fetching conversations from: ${url}`);
    const response = await apiService.get<any>(url);

    logger.debug(`[ChatService.getConversations] Raw response:`, response);

    // Handle paginated response
    if (response && response.success && response.chats && response.pagination) {
      return {
        conversations: response.chats,
        pagination: response.pagination,
      };
    }

    // Handle different response structures (backward compatibility)
    let conversations: Conversation[] = [];

    // Check if response has 'chats' property directly (most common case)
    if (response && typeof response === 'object' && 'chats' in response) {
      conversations = Array.isArray((response as any).chats) ? (response as any).chats : [];
      logger.debug(
        `[ChatService.getConversations] Found conversations in response.chats: ${conversations.length}`
      );
    }
    // Check if response.data exists and has 'chats' property
    else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      if (Array.isArray(responseData)) {
        conversations = responseData;
        logger.debug(
          `[ChatService.getConversations] Found conversations in response.data (array): ${conversations.length}`
        );
      } else if (responseData && typeof responseData === 'object' && 'chats' in responseData) {
        conversations = Array.isArray(responseData.chats) ? responseData.chats : [];
        logger.debug(
          `[ChatService.getConversations] Found conversations in response.data.chats: ${conversations.length}`
        );
      }
    }
    // Check if response is an array directly
    else if (Array.isArray(response)) {
      conversations = response;
      logger.debug(
        `[ChatService.getConversations] Response is array directly: ${conversations.length}`
      );
    }

    if (conversations.length === 0) {
      logger.warn(
        `[ChatService.getConversations] No conversations found in response. Response structure:`,
        {
          hasChats: response && typeof response === 'object' && 'chats' in response,
          hasData: response && typeof response === 'object' && 'data' in response,
          isArray: Array.isArray(response),
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
          responseType: typeof response,
        }
      );
    }

    // Map backend fields to frontend Conversation type
    const mappedConversations = conversations.map((conv) => {
      const backendConv = conv as any; // Backend may have additional fields

      // Normalize lastMessage if it exists
      let normalizedLastMessage: any = undefined;
      if (conv.lastMessage) {
        const lastMsg = conv.lastMessage as any;
        normalizedLastMessage = {
          id: lastMsg.id || '',
          conversationId: conv.id,
          senderId: lastMsg.senderId || '',
          senderName: lastMsg.senderName || lastMsg.sender?.name || '',
          senderRole: lastMsg.senderRole || lastMsg.sender?.role || 'STUDENT',
          content: lastMsg.content || '',
          timestamp: lastMsg.timestamp || lastMsg.createdAt || new Date().toISOString(),
          messageType: lastMsg.messageType || (lastMsg.type ? lastMsg.type.toLowerCase() : 'text'),
          isEdited: lastMsg.isEdited || false,
          isDeleted: lastMsg.isDeleted || false,
        };
      }

      // Ensure lastActivity is a valid date string
      let lastActivity =
        conv.lastActivity || backendConv.lastActivity || backendConv.updatedAt || conv.createdAt;

      // Validate and normalize date
      if (lastActivity) {
        try {
          const date = new Date(lastActivity);
          if (isNaN(date.getTime())) {
            // Invalid date, use current time
            lastActivity = new Date().toISOString();
          } else {
            lastActivity = date.toISOString();
          }
        } catch (e) {
          lastActivity = new Date().toISOString();
        }
      } else {
        lastActivity = new Date().toISOString();
      }

      // Ensure createdAt and updatedAt are valid dates
      let createdAt = conv.createdAt;
      if (createdAt) {
        try {
          const date = new Date(createdAt);
          if (isNaN(date.getTime())) {
            createdAt = new Date().toISOString();
          } else {
            createdAt = date.toISOString();
          }
        } catch (e) {
          createdAt = new Date().toISOString();
        }
      } else {
        createdAt = new Date().toISOString();
      }

      let updatedAt = backendConv.updatedAt || lastActivity;
      if (updatedAt) {
        try {
          const date = new Date(updatedAt);
          if (isNaN(date.getTime())) {
            updatedAt = lastActivity;
          } else {
            updatedAt = date.toISOString();
          }
        } catch (e) {
          updatedAt = lastActivity;
        }
      } else {
        updatedAt = lastActivity;
      }

      return {
        ...conv,
        // Map updatedAt to lastActivity if needed, with validation
        lastActivity,
        createdAt,
        updatedAt,
        // Ensure default values for required fields
        unreadCount: conv.unreadCount ?? 0,
        isArchived: conv.isArchived ?? false,
        isMuted: conv.isMuted ?? false,
        type: conv.type || 'direct',
        // Ensure participants is an array
        participants: Array.isArray(conv.participants) ? conv.participants : [],
        // Normalize lastMessage
        lastMessage: normalizedLastMessage,
      };
    });

    return {
      conversations: mappedConversations,
      pagination: response.pagination,
    };
  }

  /**
   * Get or create a conversation
   * Backend: POST /chats (getOrCreateChat)
   * For direct chats, backend expects: { otherUserId: string }
   * For group chats, backend expects: { participants: string[], name?: string }
   */
  async getOrCreateChat(data: CreateConversationRequest): Promise<Conversation> {
    // For direct chats, send otherUserId (first participant)
    // For group chats, send participants array
    const requestData =
      data.type === 'direct' && data.participants.length > 0
        ? { otherUserId: data.participants[0] }
        : {
            participants: data.participants,
            name: data.name,
            type: data.type,
          };

    try {
      const response = await apiService.post<Conversation>(`${this.BASE_PATH}/chats`, requestData);

      // Log the full response for debugging
      logger.debug('getOrCreateChat response', { response, requestData, data });

      // Backend may return chat in response.data.chat or response.data directly
      // Handle both cases
      let conversation: Conversation | undefined;

      // Check if response has success field (ApiResponse structure)
      if ('success' in response && !response.success) {
        const errorMessage = response.error || response.message || 'Failed to get or create chat';
        logger.error('getOrCreateChat failed', { response, requestData, errorMessage });
        throw new Error(errorMessage);
      }

      if (response.data) {
        // Check if data has a 'chat' property (backend wraps it)
        if (typeof response.data === 'object' && 'chat' in response.data) {
          conversation = (response.data as any).chat;
        } else {
          // Data is the conversation directly
          conversation = response.data as Conversation;
        }
      } else if (typeof response === 'object' && 'chat' in response) {
        // Response itself might have chat property (if not wrapped by apiService)
        conversation = (response as any).chat;
      }

      if (!conversation) {
        const errorMessage =
          response.error || response.message || 'Failed to get or create chat: No data returned';
        logger.error('getOrCreateChat returned no data', { response, requestData });
        throw new Error(errorMessage);
      }

      // Map backend fields to frontend Conversation type
      const backendConv = conversation as any; // Backend may have additional fields like updatedAt
      return {
        ...conversation,
        // Map updatedAt to lastActivity if needed
        lastActivity:
          conversation.lastActivity ||
          backendConv.updatedAt ||
          conversation.createdAt ||
          new Date().toISOString(),
        // Ensure default values for required fields
        unreadCount: conversation.unreadCount ?? 0,
        isArchived: conversation.isArchived ?? false,
        isMuted: conversation.isMuted ?? false,
        type: conversation.type || 'direct',
        // Ensure participants is an array
        participants: Array.isArray(conversation.participants) ? conversation.participants : [],
      };
    } catch (error) {
      logger.error('Error in getOrCreateChat', { error, requestData, data });
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to get or create chat: ${String(error)}`);
    }
  }

  /**
   * Create a new chat
   * Backend: POST /chats/new
   * For direct chats, backend expects: { otherUserId: string }
   * For group chats, backend expects: { participants: string[], name?: string }
   */
  async createNewChat(data: CreateConversationRequest): Promise<Conversation> {
    // For direct chats, send otherUserId (first participant)
    // For group chats, send participants array
    const requestData =
      data.type === 'direct' && data.participants.length > 0
        ? { otherUserId: data.participants[0] }
        : {
            participants: data.participants,
            name: data.name,
            type: data.type,
          };

    try {
      const response = await apiService.post<Conversation>(
        `${this.BASE_PATH}/chats/new`,
        requestData
      );

      // Check if the request was successful
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Failed to create new chat';
        logger.error('Chat creation failed', { response, requestData });
        throw new Error(errorMessage);
      }

      // Backend may return chat in response.data.chat or response.data directly
      // Handle both cases
      let conversation: Conversation | undefined;

      if (response.data) {
        // Check if data has a 'chat' property (backend wraps it)
        if (typeof response.data === 'object' && 'chat' in response.data) {
          conversation = (response.data as any).chat;
        } else {
          // Data is the conversation directly
          conversation = response.data as Conversation;
        }
      }

      if (!conversation) {
        // If the message indicates an existing chat was retrieved, fall back to getOrCreateChat
        const message = response.message || response.error || '';
        if (
          message.toLowerCase().includes('existing chat') ||
          message.toLowerCase().includes('chat retrieved')
        ) {
          logger.debug('Chat already exists, fetching existing chat', { message, requestData });
          // Fall back to getOrCreateChat to retrieve the existing chat
          return this.getOrCreateChat(data);
        }

        const errorMessage =
          response.error || response.message || 'Failed to create new chat: No data returned';
        logger.error('Chat creation returned no data', { response, requestData });
        throw new Error(errorMessage);
      }

      return conversation;
    } catch (error) {
      // If error message indicates existing chat, try getOrCreateChat as fallback
      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes('existing chat') ||
          error.message.toLowerCase().includes('chat retrieved'))
      ) {
        logger.debug('Chat already exists, fetching existing chat via getOrCreateChat', {
          error,
          requestData,
        });
        try {
          return await this.getOrCreateChat(data);
        } catch (fallbackError) {
          logger.error('Failed to get existing chat', fallbackError);
          throw fallbackError;
        }
      }

      logger.error('Error in createNewChat', { error, requestData, data });
      throw error;
    }
  }

  /**
   * Get conversation details by ID
   * First tries to get from backend API, then falls back to cached list
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    try {
      // First, try to get from backend API endpoint
      const response = await apiService.get<{ chat: Conversation }>(
        `${this.BASE_PATH}/chats/${conversationId}`
      );

      // Backend returns { chat: Conversation }
      if (response && (response as any).chat) {
        return (response as any).chat;
      }

      // If response is the conversation directly
      if (response && (response as any).id) {
        return response as any;
      }
    } catch (apiError) {
      logger.warn('Failed to fetch conversation from API, trying cached list', apiError);
    }

    // Fallback: try to get from cached conversations list
    let conversations = await this.getConversations();
    let conversation = conversations.find((c) => c.id === conversationId);

    // If not found, the conversation might have just been created
    // Try refreshing the conversations list once
    if (!conversation) {
      // Small delay to ensure backend has processed the creation
      await new Promise((resolve) => setTimeout(resolve, 200));
      conversations = await this.getConversations();
      conversation = conversations.find((c) => c.id === conversationId);
    }

    if (!conversation) {
      // Last resort: throw error
      throw new Error(
        `Conversation ${conversationId} not found. It may not exist or you may not have access to it.`
      );
    }

    return conversation;
  }

  /**
   * Create a new conversation (alias for getOrCreateChat)
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return this.getOrCreateChat(data);
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string, archived: boolean = true): Promise<void> {
    await apiService.patch(`${this.BASE_PATH}/conversations/${conversationId}/archive`, {
      archived,
    });
  }

  /**
   * Mute/unmute a conversation
   */
  async muteConversation(conversationId: string, muted: boolean): Promise<void> {
    await apiService.patch(`${this.BASE_PATH}/conversations/${conversationId}/mute`, { muted });
  }

  /**
   * Delete a conversation
   * Backend: DELETE /chats/:chatId
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/chats/${conversationId}`);
  }

  /**
   * Get messages for a conversation
   * Backend: GET /chats/:chatId/messages?page=1&limit=50
   * Backend returns: { messages: ChatMessage[], pagination: { page, limit, totalMessages, totalPages, hasMore } }
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    // Convert offset to page (backend uses page-based pagination)
    const page = Math.floor(offset / limit) + 1;

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `${this.BASE_PATH}/chats/${conversationId}/messages?${params.toString()}`;

    logger.debug(
      `[ChatService.getMessages] Fetching messages for conversation: ${conversationId}, page: ${page}, limit: ${limit}`
    );

    const response = await apiService.get<{ messages: ChatMessage[]; pagination: any }>(url);

    logger.debug(`[ChatService.getMessages] Response received`, response);

    // Backend returns: { success: true, messages: [...], pagination: {...} }
    // apiService.get returns response.data from axios, which is the response body
    let messages: ChatMessage[] = [];

    // Check if response has success field and messages property (most common case)
    if (response && typeof response === 'object' && (response as any).success && 'messages' in response) {
      messages = Array.isArray((response as any).messages) ? (response as any).messages : [];
      logger.debug(
        `[ChatService.getMessages] Found ${messages.length} messages in response.messages (success: true format)`
      );
    }
    // Check if response has 'messages' property directly
    else if (response && typeof response === 'object' && 'messages' in response) {
      messages = Array.isArray((response as any).messages) ? (response as any).messages : [];
      logger.debug(
        `[ChatService.getMessages] Found ${messages.length} messages in response.messages`
      );
    }
    // Check if response.data exists and has 'messages' property
    else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      if (Array.isArray(responseData)) {
        messages = responseData;
        logger.debug(
          `[ChatService.getMessages] Found ${messages.length} messages in response.data (array)`
        );
      } else if (responseData && typeof responseData === 'object' && 'messages' in responseData) {
        messages = Array.isArray(responseData.messages) ? responseData.messages : [];
        logger.debug(
          `[ChatService.getMessages] Found ${messages.length} messages in response.data.messages`
        );
      }
    }
    // Check if response is an array directly
    else if (Array.isArray(response)) {
      messages = response;
      logger.debug(
        `[ChatService.getMessages] Response is array directly: ${messages.length} messages`
      );
    }

    if (messages.length === 0) {
      logger.warn(`[ChatService.getMessages] No messages found in response. Response structure:`, {
        hasMessages: response && typeof response === 'object' && 'messages' in response,
        hasData: response && typeof response === 'object' && 'data' in response,
        isArray: Array.isArray(response),
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        responseType: typeof response,
      });
    } else {
      logger.debug(`[ChatService.getMessages] Returning ${messages.length} messages`);
    }

    // Normalize messages to ensure all required fields are present and handle null cases
    const normalizedMessages = messages.map((msg: any) => {
      // Extract sender information - handle both populated and unpopulated senderId
      let senderId = '';
      let senderInfo: any = {
        id: '',
        firstName: '',
        lastName: '',
        name: 'Unknown User',
        profileImage: null,
        role: 'STUDENT',
      };

      // Handle senderId - could be string, ObjectId, or populated user object
      if (msg.senderId) {
        if (typeof msg.senderId === 'object' && msg.senderId !== null) {
          // Populated user object
          senderId = msg.senderId._id ? msg.senderId._id.toString() : (msg.senderId.toString?.() || '');
          senderInfo = {
            id: senderId,
            firstName: msg.senderId.firstName || '',
            lastName: msg.senderId.lastName || '',
            name: `${msg.senderId.firstName || ''} ${msg.senderId.lastName || ''}`.trim() || 'Unknown User',
            profileImage: msg.senderId.profileImage || null,
            role: msg.senderId.role || 'STUDENT',
          };
        } else {
          // String or ObjectId
          senderId = typeof msg.senderId === 'string' ? msg.senderId : String(msg.senderId);
        }
      }

      // Use msg.sender if available (might be populated separately)
      if (msg.sender && typeof msg.sender === 'object') {
        senderInfo = {
          id: msg.sender.id || senderId || msg.sender._id?.toString() || '',
          firstName: msg.sender.firstName || '',
          lastName: msg.sender.lastName || '',
          name: msg.sender.name || `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || 'Unknown User',
          profileImage: msg.sender.profileImage || null,
          role: msg.sender.role || 'STUDENT',
        };
        senderId = senderInfo.id || senderId;
      }

      return {
        id: msg.id || msg._id?.toString() || '',
        conversationId: msg.conversationId || msg.chatId || '',
        chatId: msg.chatId || msg.conversationId || '',
        senderId: senderId,
        sender: senderInfo,
        type: msg.type || 'TEXT',
        content: msg.content || '',
        fileUrl: msg.fileUrl || null,
        fileName: msg.fileName || null,
        isRead: msg.isRead || false,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        isEdited: msg.isEdited || false,
        isDeleted: msg.isDeleted || false,
      };
    });

    logger.debug(`[ChatService.getMessages] Normalized ${normalizedMessages.length} messages`);
    return normalizedMessages;
  }

  /**
   * Send a message in a conversation
   * Backend: POST /chats/:chatId/messages
   * Backend expects: { content, type, fileUrl?, fileName? }
   * Backend returns: { message: ChatMessage }
   */
  async sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
    // Extract file URL and name from attachments if present
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let messageType: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT';

    if (data.attachments && data.attachments.length > 0) {
      const firstAttachment = data.attachments[0];
      fileUrl = firstAttachment.url || firstAttachment.fileUrl;
      fileName = firstAttachment.name || firstAttachment.fileName;

      // Determine type based on file extension
      if (fileUrl && fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
          messageType = 'IMAGE';
        } else {
          messageType = 'FILE';
        }
      }
    } else if (data.messageType) {
      // Map frontend messageType to backend type
      const typeMap: Record<string, 'TEXT' | 'FILE' | 'IMAGE'> = {
        text: 'TEXT',
        document: 'FILE',
        file: 'FILE',
        image: 'IMAGE',
        video: 'FILE',
        audio: 'FILE',
      };
      messageType = typeMap[data.messageType.toLowerCase()] || 'TEXT';
    }

    const response = await apiService.post<{ message: ChatMessage }>(
      `${this.BASE_PATH}/chats/${data.conversationId}/messages`,
      {
        content: data.content,
        type: messageType,
        fileUrl,
        fileName,
      }
    );

    // Backend returns { message: ChatMessage }
    // apiService.post returns the response body directly
    let message: ChatMessage | undefined;

    if (response) {
      // Check if response has a 'message' property (backend wraps it)
      if (typeof response === 'object' && 'message' in response) {
        message = (response as any).message;
      }
      // Check if response.data exists and has message
      else if (
        (response as any).data &&
        typeof (response as any).data === 'object' &&
        'message' in (response as any).data
      ) {
        message = (response as any).data.message;
      }
      // Check if response.data is the message directly
      else if ((response as any).data) {
        message = (response as any).data;
      }
      // Check if response itself is the message (unlikely but handle it)
      else if ((response as any).id && (response as any).content) {
        message = response as any;
      }
    }

    if (!message) {
      logger.error('Failed to parse message response', response);
      throw new Error('Failed to send message: No data in response');
    }

    // Normalize message format
    if (message) {
      // Ensure senderId is a string
      if (message.senderId && typeof message.senderId !== 'string') {
        message.senderId = String(message.senderId);
      }

      // Ensure timestamp exists
      if (!message.timestamp && message.createdAt) {
        message.timestamp = message.createdAt;
      }

      // Ensure conversationId exists
      if (!message.conversationId && (message as any).chatId) {
        message.conversationId = (message as any).chatId;
      }
    }

    return message;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, data: EditMessageRequest): Promise<ChatMessage> {
    const response = await apiService.put<ChatMessage>(
      `${this.BASE_PATH}/messages/${messageId}`,
      data
    );

    if (!response.data) {
      throw new Error('Failed to edit message');
    }

    return response.data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/messages/${messageId}`);
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/messages/${messageId}/reactions`, { emoji });
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, reactionId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/messages/${messageId}/reactions/${reactionId}`);
  }

  /**
   * Mark messages as read
   * Backend: PUT /chats/:chatId/read
   */
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/chats/${conversationId}/read`, {
      messageIds,
    });
  }

  /**
   * Get unread message count
   * Backend: GET /unread-count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>(`${this.BASE_PATH}/unread-count`);
    return response.data?.count || 0;
  }

  /**
   * Get available users (without search)
   * Backend: GET /users/available
   * Response: { users: [...] }
   */
  async getAvailableUsers(): Promise<any[]> {
    const url = `${this.BASE_PATH}/users/available`;

    logger.debug(`[ChatService.getAvailableUsers] Fetching available users from: ${url}`);

    const response = await apiService.get<{ users: any[] }>(url);

    logger.debug(`[ChatService.getAvailableUsers] Response received`, response);

    // Backend returns: { users: [...] }
    // apiService.get returns response.data from axios, which is the response body
    let users: any[] = [];

    // Check if response has 'users' property directly
    if (response && typeof response === 'object' && 'users' in response) {
      users = Array.isArray((response as any).users) ? (response as any).users : [];
      logger.debug(`[ChatService.getAvailableUsers] Found ${users.length} users in response.users`);
    }
    // Check if response.data exists and has 'users' property
    else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      if (Array.isArray(responseData)) {
        users = responseData;
        logger.debug(
          `[ChatService.getAvailableUsers] Found ${users.length} users in response.data (array)`
        );
      } else if (responseData && typeof responseData === 'object' && 'users' in responseData) {
        users = Array.isArray(responseData.users) ? responseData.users : [];
        logger.debug(
          `[ChatService.getAvailableUsers] Found ${users.length} users in response.data.users`
        );
      }
    }
    // Check if response is an array directly
    else if (Array.isArray(response)) {
      users = response;
      logger.debug(
        `[ChatService.getAvailableUsers] Response is array directly: ${users.length} users`
      );
    }

    if (users.length === 0) {
      logger.warn(
        `[ChatService.getAvailableUsers] No users found in response. Response structure:`,
        {
          hasUsers: response && typeof response === 'object' && 'users' in response,
          hasData: response && typeof response === 'object' && 'data' in response,
          isArray: Array.isArray(response),
          responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
          responseType: typeof response,
        }
      );
    } else {
      logger.debug(`[ChatService.getAvailableUsers] Returning ${users.length} available users`);
    }

    return users;
  }

  /**
   * Search users
   * Backend: GET /users/search
   * Response: { users: [...] }
   * Note: apiService.get returns ApiResponse<T> which is { success, data: T }
   * But the backend might return { users: [...] } directly or wrapped
   */
  async searchUsers(query: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('query', query);

    const url = `${this.BASE_PATH}/users/search?${params.toString()}`;
    const response = await apiService.get<{ users: any[] }>(url);

    // Debug: Log the response structure
    logger.debug('Search users full response', JSON.stringify(response, null, 2));

    // apiService.get returns ApiResponse<T> = { success, data: T, message?, error? }
    // If backend returns { users: [...] }, then response.data = { users: [...] }
    // So we need to check response.data.users

    // First check if response.data exists and has users property
    if (response.data && typeof response.data === 'object') {
      // Check if response.data has users property
      if ('users' in response.data && Array.isArray((response.data as any).users)) {
        const users = (response.data as any).users;
        logger.debug('Found users in response.data.users', users);
        return users;
      }

      // Check if response.data is directly an array (unlikely but possible)
      if (Array.isArray(response.data)) {
        logger.debug('Response.data is directly an array', response.data);
        return response.data;
      }
    }

    // Fallback: check if response itself has users (if backend response wasn't wrapped)
    if (
      response &&
      typeof response === 'object' &&
      'users' in response &&
      Array.isArray((response as any).users)
    ) {
      logger.debug('Found users in response directly', (response as any).users);
      return (response as any).users;
    }

    logger.debug('No users found. Response structure:', {
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      responseKeys: Object.keys(response),
    });

    return [];
  }

  /**
   * Upload a file attachment
   */
  async uploadFile(file: File): Promise<MessageAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.post<UploadFileResponse>(
      `${this.BASE_PATH}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data?.attachment) {
      throw new Error('Failed to upload file');
    }

    return response.data.attachment;
  }

  /**
   * Report a conversation or message
   */
  async reportConversation(data: {
    conversationId: string;
    reason: ChatReport['reason'];
    description: string;
    messageId?: string;
  }): Promise<void> {
    await apiService.post(`${this.BASE_PATH}/reports`, data);
  }

  /**
   * Search messages within conversations
   */
  async searchMessages(query: string, conversationId?: string): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (conversationId) params.append('conversationId', conversationId);

    const url = `${this.BASE_PATH}/messages/search?${params.toString()}`;

    const response = await apiService.get<ChatMessage[]>(url);
    return response.data || [];
  }
}

export const chatService = new ChatService();
export default chatService;
