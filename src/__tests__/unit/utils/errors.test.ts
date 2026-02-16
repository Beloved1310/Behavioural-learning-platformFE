import { describe, it, expect } from 'vitest';
import { AppError, isAppError, getErrorMessage, getErrorCode } from '@/utils/errors';

describe('Errors Utility - Unit Tests', () => {
  describe('AppError Class', () => {
    it('should create AppError with message', () => {
      const error = new AppError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with code', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should create AppError with statusCode', () => {
      const error = new AppError('Test error', 'TEST_CODE', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should create AppError with details', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new AppError('Test error', 'TEST_CODE', 400, details);
      expect(error.details).toEqual(details);
    });

    it('should create AppError with all properties', () => {
      const details = { field: 'email' };
      const error = new AppError('Test error', 'TEST_CODE', 400, details);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('AppError Static Methods', () => {
    describe('fromApiResponse', () => {
      it('should create AppError from API response with error message', () => {
        const apiError = { error: 'API error message' };
        const error = AppError.fromApiResponse(apiError);
        expect(error.message).toBe('API error message');
      });

      it('should create AppError from API response with message property', () => {
        const apiError = { message: 'Message property' };
        const error = AppError.fromApiResponse(apiError);
        expect(error.message).toBe('Message property');
      });

      it('should use default message when no error or message', () => {
        const apiError = {};
        const error = AppError.fromApiResponse(apiError, 'Default message');
        expect(error.message).toBe('Default message');
      });

      it('should extract code from API response', () => {
        const apiError = { error: 'Error', code: 'API_ERROR_CODE' };
        const error = AppError.fromApiResponse(apiError);
        expect(error.code).toBe('API_ERROR_CODE');
      });

      it('should extract statusCode from API response', () => {
        const apiError = { error: 'Error', statusCode: 500 };
        const error = AppError.fromApiResponse(apiError);
        expect(error.statusCode).toBe(500);
      });

      it('should extract statusCode from response.status', () => {
        const apiError = { error: 'Error', response: { status: 403 } };
        const error = AppError.fromApiResponse(apiError);
        expect(error.statusCode).toBe(403);
      });

      it('should extract details from API response', () => {
        const details = { field: 'email' };
        const apiError = { error: 'Error', details };
        const error = AppError.fromApiResponse(apiError);
        expect(error.details).toEqual(details);
      });
    });

    describe('network', () => {
      it('should create network error with default message', () => {
        const error = AppError.network();
        expect(error.message).toBe('Network error. Please check your connection.');
        expect(error.code).toBe('NETWORK_ERROR');
      });

      it('should create network error with custom message', () => {
        const error = AppError.network('Custom network error');
        expect(error.message).toBe('Custom network error');
        expect(error.code).toBe('NETWORK_ERROR');
      });
    });

    describe('validation', () => {
      it('should create validation error with message', () => {
        const error = AppError.validation('Validation failed');
        expect(error.message).toBe('Validation failed');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(422);
      });

      it('should create validation error with details', () => {
        const details = { field: 'email', reason: 'invalid format' };
        const error = AppError.validation('Validation failed', details);
        expect(error.details).toEqual(details);
      });
    });

    describe('auth', () => {
      it('should create auth error with default message', () => {
        const error = AppError.auth();
        expect(error.message).toBe('Authentication required');
        expect(error.code).toBe('AUTH_ERROR');
        expect(error.statusCode).toBe(401);
      });

      it('should create auth error with custom message', () => {
        const error = AppError.auth('Custom auth error');
        expect(error.message).toBe('Custom auth error');
        expect(error.code).toBe('AUTH_ERROR');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('notFound', () => {
      it('should create not found error with default message', () => {
        const error = AppError.notFound();
        expect(error.message).toBe('Resource not found');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
      });

      it('should create not found error with custom message', () => {
        const error = AppError.notFound('Custom not found');
        expect(error.message).toBe('Custom not found');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
      });
    });

    describe('forbidden', () => {
      it('should create forbidden error with default message', () => {
        const error = AppError.forbidden();
        expect(error.message).toBe('Permission denied');
        expect(error.code).toBe('FORBIDDEN');
        expect(error.statusCode).toBe(403);
      });

      it('should create forbidden error with custom message', () => {
        const error = AppError.forbidden('Custom forbidden');
        expect(error.message).toBe('Custom forbidden');
        expect(error.code).toBe('FORBIDDEN');
        expect(error.statusCode).toBe(403);
      });
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instance', () => {
      const error = new AppError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isAppError('string error')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isAppError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAppError(undefined)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isAppError({ message: 'error' })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return message from AppError', () => {
      const error = new AppError('App error message');
      expect(getErrorMessage(error)).toBe('App error message');
    });

    it('should return message from Error', () => {
      const error = new Error('Error message');
      expect(getErrorMessage(error)).toBe('Error message');
    });

    it('should return string error as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown error type', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });

    it('should return custom default message', () => {
      expect(getErrorMessage(null, 'Custom default')).toBe('Custom default');
    });
  });

  describe('getErrorCode', () => {
    it('should return code from AppError', () => {
      const error = new AppError('Error', 'ERROR_CODE');
      expect(getErrorCode(error)).toBe('ERROR_CODE');
    });

    it('should return undefined for AppError without code', () => {
      const error = new AppError('Error');
      expect(getErrorCode(error)).toBeUndefined();
    });

    it('should return undefined for regular Error', () => {
      const error = new Error('Error');
      expect(getErrorCode(error)).toBeUndefined();
    });

    it('should return undefined for string', () => {
      expect(getErrorCode('string error')).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(getErrorCode(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(getErrorCode(undefined)).toBeUndefined();
    });
  });
});

