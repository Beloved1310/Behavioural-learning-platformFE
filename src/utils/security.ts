// Security utilities for the payment system

// Content Security Policy helpers
export const sanitizeHTML = (html: string): string => {
  // Simple HTML sanitization (in production, use a library like DOMPurify)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '');
};

// Generate secure random IDs
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Mask sensitive data for logging
export const maskSensitiveData = (data: Record<string, any>): Record<string, any> => {
  const sensitiveFields = ['cardNumber', 'cvv', 'ssn', 'accountNumber', 'routingNumber'];
  const masked = { ...data };

  for (const [key, value] of Object.entries(masked)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      if (typeof value === 'string' && value.length > 4) {
        masked[key] = '*'.repeat(value.length - 4) + value.slice(-4);
      } else {
        masked[key] = '***';
      }
    }
  }

  return masked;
};

// Validate HTTPS connection
export const validateSecureConnection = (): boolean => {
  return location.protocol === 'https:' || location.hostname === 'localhost';
};

// Check for common security headers (client-side detection)
export const checkSecurityHeaders = async (): Promise<{
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
}> => {
  try {
    const response = await fetch(window.location.href, { method: 'HEAD' });
    const headers = response.headers;

    return {
      hasCSP: headers.has('content-security-policy'),
      hasXFrameOptions: headers.has('x-frame-options'),
      hasXContentTypeOptions: headers.has('x-content-type-options')
    };
  } catch {
    return {
      hasCSP: false,
      hasXFrameOptions: false,
      hasXContentTypeOptions: false
    };
  }
};

// Session security utilities
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static lastActivity = Date.now();

  public static updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  public static isSessionExpired(): boolean {
    return Date.now() - this.lastActivity > this.SESSION_TIMEOUT;
  }

  public static getRemainingTime(): number {
    const remaining = this.SESSION_TIMEOUT - (Date.now() - this.lastActivity);
    return Math.max(0, remaining);
  }

  public static startActivityMonitoring(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => {
      this.updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session expiry every minute
    setInterval(() => {
      if (this.isSessionExpired()) {
        this.handleSessionExpiry();
      }
    }, 60000);
  }

  private static handleSessionExpiry(): void {
    // Clear sensitive data
    localStorage.removeItem('accessToken');
    sessionStorage.clear();

    // Redirect to login with a message
    window.location.href = '/login?reason=session_expired';
  }
}

// Payment security utilities
export class PaymentSecurity {
  // Validate payment environment
  public static validatePaymentEnvironment(): {
    isSecure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check HTTPS
    if (!validateSecureConnection()) {
      issues.push('Connection is not secure (HTTPS required)');
    }

    // Check for mixed content
    if (location.protocol === 'https:' && document.querySelector('[src^="http:"], [href^="http:"]')) {
      issues.push('Mixed content detected (HTTP resources on HTTPS page)');
    }

    // Check for developer tools (basic detection)
    if (this.isDeveloperToolsOpen()) {
      issues.push('Developer tools are open');
    }

    return {
      isSecure: issues.length === 0,
      issues
    };
  }

  // Basic developer tools detection
  private static isDeveloperToolsOpen(): boolean {
    const threshold = 160;
    return (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    );
  }

  // Encrypt sensitive data before storing (simple example)
  public static encryptForStorage(data: string, key: string): string {
    // This is a simple XOR encryption - in production, use proper encryption
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  }

  // Decrypt data from storage
  public static decryptFromStorage(encryptedData: string, key: string): string {
    try {
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return decrypted;
    } catch {
      return '';
    }
  }
}

// CSRF protection utility
export const generateCSRFToken = (): string => {
  return generateSecureId();
};

// Input validation middleware
export const secureInputValidator = (input: string, maxLength: number = 255): string => {
  return sanitizeHTML(input)
    .trim()
    .substring(0, maxLength);
};

// Audit logging utility (for security events)
export class SecurityAudit {
  private static logs: Array<{
    timestamp: string;
    event: string;
    details: Record<string, any>;
    userAgent: string;
  }> = [];

  public static log(event: string, details: Record<string, any> = {}): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      event,
      details: maskSensitiveData(details),
      userAgent: navigator.userAgent
    });

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // In production, send to secure logging service
    console.log(`[SECURITY AUDIT] ${event}`, details);
  }

  public static getLogs(): typeof SecurityAudit.logs {
    return [...this.logs];
  }

  public static clearLogs(): void {
    this.logs = [];
  }
}

// Browser security checks
export const performSecurityChecks = (): {
  passed: boolean;
  checks: Record<string, boolean>;
  warnings: string[];
} => {
  const checks = {
    httpsConnection: validateSecureConnection(),
    sessionStorage: typeof sessionStorage !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    crypto: typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function',
    fetch: typeof fetch !== 'undefined'
  };

  const warnings: string[] = [];

  if (!checks.httpsConnection) {
    warnings.push('Insecure connection detected');
  }

  if (!checks.crypto) {
    warnings.push('Crypto API not available');
  }

  const passed = Object.values(checks).every(Boolean) && warnings.length === 0;

  return { passed, checks, warnings };
};

// Initialize security monitoring
export const initializeSecurity = (): void => {
  // Start session monitoring
  SessionSecurity.startActivityMonitoring();

  // Log security initialization
  SecurityAudit.log('security_initialized', {
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  // Perform initial security checks
  const securityCheck = performSecurityChecks();
  if (!securityCheck.passed) {
    SecurityAudit.log('security_warnings', {
      warnings: securityCheck.warnings,
      checks: securityCheck.checks
    });
  }
};

export default {
  sanitizeHTML,
  generateSecureId,
  maskSensitiveData,
  validateSecureConnection,
  SessionSecurity,
  PaymentSecurity,
  SecurityAudit,
  initializeSecurity,
  performSecurityChecks
};