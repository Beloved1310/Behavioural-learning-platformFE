/**
 * Logger utility for consistent logging across the frontend application
 * Replaces console.log/error/warn with a structured logging approach
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorContext: LogContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        ...(this.isDevelopment && { stack: error.stack }),
      }),
    };

    console.error(this.formatMessage('ERROR', message, errorContext));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatMessage('WARN', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatMessage('INFO', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.debug(this.formatMessage('DEBUG', message, context));
  }

  /**
   * Log API request
   */
  api(
    method: string,
    url: string,
    statusCode?: number,
    duration?: number,
    context?: LogContext
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const message = `API ${method} ${url}${statusCode ? ` ${statusCode}` : ''}${duration ? ` - ${duration}ms` : ''}`;
    this.debug(message, context);
  }

  /**
   * Log component lifecycle
   */
  component(componentName: string, action: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.debug(`Component ${componentName} ${action}`, context);
  }

  /**
   * Log user action
   */
  userAction(action: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.info(`User action: ${action}`, context);
  }
}

export const logger = new Logger();
export default logger;
