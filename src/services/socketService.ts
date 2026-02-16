import { io, Socket } from 'socket.io-client';
import { ChatMessage, OnlineStatus, TypingIndicator } from '../types';
import { logger } from '../utils/logger';

type SocketEventCallback = (...args: any[]) => void;

interface SocketEvents {
  // Incoming events
  new_message: (message: ChatMessage) => void;
  user_online_status: (status: OnlineStatus) => void;
  user_typing: (indicator: TypingIndicator) => void;
  user_stopped_typing: (indicator: { userId: string; conversationId: string }) => void;
  message_deleted: (data: { messageId: string; conversationId: string }) => void;
  message_edited: (data: { messageId: string; content: string; conversationId: string }) => void;
  reaction_added: (data: { messageId: string; userId: string; emoji: string }) => void;
  reaction_removed: (data: { messageId: string; userId: string; emoji: string }) => void;
  new_notification: (notification: any) => void;
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<SocketEventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  /**
   * Initialize socket connection
   */
  connect(token?: string): void {
    if (this.socket?.connected || this.isConnecting) {
      logger.warn('Socket already connected or connecting');
      return;
    }

    // Get token from parameter or localStorage
    const authToken = token || localStorage.getItem('accessToken');

    if (!authToken) {
      logger.error('No authentication token found. Cannot connect socket.');
      this.emitToHandlers('error', new Error('No authentication token available'));
      return;
    }

    this.isConnecting = true;
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      // Socket.io auth can be sent in different formats depending on backend
      // Try sending just the token value first (most common)
      this.socket = io(baseURL, {
        auth: {
          token: authToken,
        },
        // Also send in extraHeaders for HTTP-based transports
        extraHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        // Force new connection to avoid stale connections
        forceNew: true,
      });

      this.setupEventListeners();
      this.isConnecting = false;
    } catch (error) {
      logger.error('Failed to initialize socket connection', error);
      this.isConnecting = false;
      this.emitToHandlers('error', error);
    }
  }

  /**
   * Setup core socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('Socket connected', { socketId: this.socket?.id || 'connected' });
      this.reconnectAttempts = 0;
      this.emitToHandlers('connected');
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { reason });
      this.emitToHandlers('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket connection error', error);

      // Handle authentication errors specifically
      if (error.message && error.message.includes('Authentication')) {
        logger.error('Socket authentication failed. Token may be invalid or expired.');
        // Try to get a fresh token
        const freshToken = localStorage.getItem('accessToken');
        if (freshToken && freshToken !== this.socket?.auth?.token) {
          logger.info('Attempting to reconnect with fresh token');
          this.disconnect();
          setTimeout(() => this.connect(freshToken), 1000);
          return;
        } else {
          logger.error('No valid token available. Please log in again.');
          this.emitToHandlers('error', new Error('Authentication failed. Please log in again.'));
          this.disconnect();
          return;
        }
      }

      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error('Max reconnection attempts reached');
        this.disconnect();
      }

      this.emitToHandlers('error', error);
    });

    // Chat-specific events
    this.socket.on('new_message', (message: any) => {
      logger.debug('Received new_message event from socket', {
        id: message?.id || message?._id,
        conversationId: message?.conversationId || message?.chatId,
        senderId: message?.senderId,
        content: message?.content?.substring(0, 50),
      });

      // Normalize message format - backend may send _id instead of id, chatId instead of conversationId
      if (!message || !message.content) {
        logger.error('Invalid message received from socket (missing content)', undefined, {
          message,
        });
        return;
      }

      // Normalize the message to match ChatMessage type
      // Handle both formatted messages (id, conversationId) and raw messages (_id, chatId)
      const messageId =
        message.id ||
        (message._id
          ? typeof message._id === 'string'
            ? message._id
            : message._id.toString()
          : '');
      const conversationId = message.conversationId || message.chatId || '';

      const normalizedMessage: ChatMessage = {
        id: messageId,
        conversationId: conversationId,
        senderId:
          typeof message.senderId === 'string'
            ? message.senderId
            : message.senderId?._id
              ? typeof message.senderId._id === 'string'
                ? message.senderId._id
                : message.senderId._id.toString()
              : message.senderId
                ? String(message.senderId)
                : '',
        sender: message.sender || {
          id:
            typeof message.senderId === 'string'
              ? message.senderId
              : message.senderId?._id
                ? typeof message.senderId._id === 'string'
                  ? message.senderId._id
                  : message.senderId._id.toString()
                : message.senderId
                  ? String(message.senderId)
                  : '',
          firstName: message.senderId?.firstName || message.sender?.firstName || '',
          lastName: message.senderId?.lastName || message.sender?.lastName || '',
          name:
            message.sender?.name ||
            (message.senderId?.firstName && message.senderId?.lastName
              ? `${message.senderId.firstName} ${message.senderId.lastName}`
              : ''),
          profileImage: message.senderId?.profileImage || message.sender?.profileImage || null,
          role: message.senderId?.role || message.sender?.role || '',
        },
        type: message.type || 'TEXT',
        content: message.content || '',
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null,
        isRead: message.isRead || false,
        timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
        createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
      };

      // Validate normalized message has required fields
      if (normalizedMessage.id && normalizedMessage.conversationId && normalizedMessage.content) {
        logger.debug('Normalized message', {
          id: normalizedMessage.id,
          conversationId: normalizedMessage.conversationId,
          content: normalizedMessage.content.substring(0, 30) + '...',
        });
        this.emitToHandlers('new_message', normalizedMessage);
      } else {
        logger.error('Invalid message format after normalization', undefined, {
          normalizedMessage,
        });
      }
    });

    this.socket.on('user_online_status', (status: OnlineStatus) => {
      logger.debug('User online status update', { status });
      this.emitToHandlers('user_online_status', status);
    });

    this.socket.on('user_typing', (indicator: TypingIndicator) => {
      this.emitToHandlers('user_typing', indicator);
    });

    this.socket.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
      this.emitToHandlers('user_stopped_typing', data);
    });

    this.socket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
      this.emitToHandlers('message_deleted', data);
    });

    this.socket.on(
      'message_edited',
      (data: { messageId: string; content: string; conversationId: string }) => {
        this.emitToHandlers('message_edited', data);
      }
    );

    this.socket.on(
      'reaction_added',
      (data: { messageId: string; userId: string; emoji: string }) => {
        this.emitToHandlers('reaction_added', data);
      }
    );

    this.socket.on(
      'reaction_removed',
      (data: { messageId: string; userId: string; emoji: string }) => {
        this.emitToHandlers('reaction_removed', data);
      }
    );

    // Notification events
    this.socket.on('new_notification', (notification: any) => {
      logger.debug('New notification received via socket', { notification });
      this.emitToHandlers('new_notification', notification);
    });
  }

  /**
   * Emit to all registered handlers for an event
   */
  private emitToHandlers(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          logger.error(`Error in handler for event ${event}`, error);
        }
      });
    }
  }

  /**
   * Register an event handler
   */
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback as SocketEventCallback);
  }

  /**
   * Unregister an event handler
   */
  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback as SocketEventCallback);
    }
  }

  /**
   * Update user online status
   */
  updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (!this.socket?.connected) {
      logger.warn('Socket not connected, cannot update status');
      return;
    }

    this.socket.emit('update_status', status);
  }

  /**
   * Join a chat conversation
   */
  joinChat(chatId: string): void {
    if (!this.socket?.connected) {
      logger.warn('Socket not connected, cannot join chat', { chatId });
      return;
    }

    this.socket.emit('join_chat', chatId);
  }

  /**
   * Leave a chat conversation
   */
  leaveChat(chatId: string): void {
    if (!this.socket?.connected) {
      logger.warn('Socket not connected, cannot leave chat');
      return;
    }

    logger.debug('Leaving chat', { chatId });
    this.socket.emit('leave_chat', chatId);
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', { conversationId });
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('stop_typing', { conversationId });
  }

  /**
   * Send a message via WebSocket for instant delivery
   */
  sendMessage(conversationId: string, content: string, attachments?: any[]): void {
    if (!this.socket?.connected) {
      logger.warn('Socket not connected, cannot send message');
      return;
    }

    logger.debug('Sending message via WebSocket', {
      conversationId,
      content: content.substring(0, 50) + '...',
    });

    // Determine message type based on attachments
    let messageType: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT';
    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (attachments && attachments.length > 0) {
      const firstAttachment = attachments[0];
      fileUrl = firstAttachment.url || firstAttachment.fileUrl;
      fileName = firstAttachment.name || firstAttachment.fileName;

      // Determine type based on file extension or MIME type
      if (fileUrl) {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
          messageType = 'IMAGE';
        } else {
          messageType = 'FILE';
        }
      }
    }

    const messageData = {
      chatId: conversationId, // Backend expects chatId
      content,
      type: messageType,
      fileUrl,
      fileName,
    };

    logger.debug('Emitting send_message event', {
      chatId: messageData.chatId,
      type: messageData.type,
      hasContent: !!messageData.content,
      contentLength: messageData.content.length,
    });

    this.socket.emit('send_message', messageData);
    logger.debug('Message emitted successfully');
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageIds?: string[]): void {
    if (!this.socket?.connected) return;

    this.socket.emit('mark_as_read', {
      conversationId,
      messageIds,
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      logger.info('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Manually reconnect
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
