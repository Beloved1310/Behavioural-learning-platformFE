/**
 * Frontend error types and utilities
 */

export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create error from API response
   */
  static fromApiResponse(error: any, defaultMessage: string = 'An error occurred'): AppError {
    const message = error?.error || error?.message || defaultMessage;
    const code = error?.code;
    const statusCode = error?.statusCode || error?.response?.status;
    const details = error?.details;

    return new AppError(message, code, statusCode, details);
  }

  /**
   * Create network error
   */
  static network(message: string = 'Network error. Please check your connection.'): AppError {
    return new AppError(message, 'NETWORK_ERROR');
  }

  /**
   * Create validation error
   */
  static validation(message: string, details?: any): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 422, details);
  }

  /**
   * Create authentication error
   */
  static auth(message: string = 'Authentication required'): AppError {
    return new AppError(message, 'AUTH_ERROR', 401);
  }

  /**
   * Create not found error
   */
  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  /**
   * Create permission error
   */
  static forbidden(message: string = 'Permission denied'): AppError {
    return new AppError(message, 'FORBIDDEN', 403);
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get error message from any error type
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
}

/**
 * Get error code from any error type
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.code;
  }
  return undefined;
}
