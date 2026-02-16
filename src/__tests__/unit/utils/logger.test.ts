import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from '@/utils/logger';

describe('Logger Utility - Unit Tests', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('ERROR');
      expect(call).toContain('Test error');
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('Error occurred');
    });

    it('should log error with context', () => {
      const context = { userId: '123', action: 'login' };
      logger.error('Error occurred', undefined, context);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('Error occurred');
      expect(call).toContain('userId');
    });

    it('should include error details in context when Error object provided', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('errorName');
      expect(call).toContain('errorMessage');
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('WARN');
      expect(call).toContain('Test warning');
    });

    it('should log warning with context', () => {
      const context = { component: 'Button' };
      logger.warn('Warning occurred', context);
      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('Warning occurred');
      expect(call).toContain('component');
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test info');
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('INFO');
      expect(call).toContain('Test info');
    });

    it('should log info with context', () => {
      const context = { action: 'click' };
      logger.info('Info message', context);
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('Info message');
      expect(call).toContain('action');
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('Test debug');
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('DEBUG');
      expect(call).toContain('Test debug');
    });

    it('should log debug with context', () => {
      const context = { variable: 'value' };
      logger.debug('Debug message', context);
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('Debug message');
      expect(call).toContain('variable');
    });
  });

  describe('api', () => {
    it('should log API request with method and URL', () => {
      logger.api('GET', '/api/users');
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('API GET /api/users');
    });

    it('should log API request with status code', () => {
      logger.api('POST', '/api/users', 200);
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('200');
    });

    it('should log API request with duration', () => {
      logger.api('GET', '/api/users', 200, 150);
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('150ms');
    });

    it('should log API request with context', () => {
      const context = { hasToken: true };
      logger.api('GET', '/api/users', 200, 150, context);
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('hasToken');
    });
  });

  describe('component', () => {
    it('should log component lifecycle', () => {
      logger.component('Button', 'mounted');
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('Component Button mounted');
    });

    it('should log component lifecycle with context', () => {
      const context = { props: { variant: 'primary' } };
      logger.component('Button', 'updated', context);
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('Component Button updated');
      expect(call).toContain('props');
    });
  });

  describe('userAction', () => {
    it('should log user action', () => {
      logger.userAction('button clicked');
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('User action: button clicked');
    });

    it('should log user action with context', () => {
      const context = { buttonId: 'submit-btn' };
      logger.userAction('button clicked', context);
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('User action: button clicked');
      expect(call).toContain('buttonId');
    });
  });

  describe('Message Formatting', () => {
    it('should include timestamp in log messages', () => {
      logger.info('Test message');
      const call = consoleInfoSpy.mock.calls[0][0];
      // Should contain ISO timestamp format
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should format context as JSON', () => {
      const context = { key: 'value', number: 123 };
      logger.info('Test message', context);
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('"key":"value"');
      expect(call).toContain('"number":123');
    });

    it('should handle empty context', () => {
      logger.info('Test message');
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('Test message');
      // Should not have extra JSON formatting
    });
  });
});

