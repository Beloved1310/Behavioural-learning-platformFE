// Payment validation utilities with security measures

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string | number;
}

// Credit card number validation
export const validateCreditCardNumber = (cardNumber: string): ValidationResult => {
  if (!cardNumber) {
    return { isValid: false, error: 'Card number is required' };
  }

  // Remove all non-digit characters
  const sanitized = cardNumber.replace(/\D/g, '');

  // Check length (13-19 digits for most cards)
  if (sanitized.length < 13 || sanitized.length > 19) {
    return { isValid: false, error: 'Card number must be between 13-19 digits' };
  }

  // Luhn algorithm validation
  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const isValid = sum % 10 === 0;

  return {
    isValid,
    error: isValid ? undefined : 'Invalid card number',
    sanitizedValue: sanitized
  };
};

// Credit card expiry validation
export const validateCardExpiry = (month: string, year: string): ValidationResult => {
  if (!month || !year) {
    return { isValid: false, error: 'Month and year are required' };
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Validate month
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Invalid month' };
  }

  // Validate year (current year to 20 years in future)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (yearNum < currentYear || yearNum > currentYear + 20) {
    return { isValid: false, error: 'Invalid expiry year' };
  }

  // Check if card is expired
  if (yearNum === currentYear && monthNum < currentMonth) {
    return { isValid: false, error: 'Card is expired' };
  }

  return { isValid: true };
};

// CVV validation
export const validateCVV = (cvv: string, cardType?: string): ValidationResult => {
  if (!cvv) {
    return { isValid: false, error: 'CVV is required' };
  }

  const sanitized = cvv.replace(/\D/g, '');

  // American Express has 4-digit CVV, others have 3
  const expectedLength = cardType === 'amex' ? 4 : 3;

  if (sanitized.length !== expectedLength) {
    return {
      isValid: false,
      error: `CVV must be ${expectedLength} digits`
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());

  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid email address',
    sanitizedValue: email.trim().toLowerCase()
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const sanitized = phone.replace(/\D/g, '');

  // Check length (10 digits for US numbers)
  if (sanitized.length < 10 || sanitized.length > 15) {
    return {
      isValid: false,
      error: 'Phone number must be between 10-15 digits'
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
};

// Amount validation for payments
export const validateAmount = (amount: string | number): ValidationResult => {
  if (!amount && amount !== 0) {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Invalid amount format' };
  }

  if (numAmount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (numAmount > 10000) {
    return { isValid: false, error: 'Amount cannot exceed $10,000' };
  }

  // Round to 2 decimal places
  const sanitized = Math.round(numAmount * 100) / 100;

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
};

// Input sanitization to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'/]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 255); // Limit length
};

// Card type detection
export const detectCardType = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\D/g, '');

  // Visa
  if (/^4/.test(sanitized)) {
    return 'visa';
  }

  // Mastercard
  if (/^5[1-5]/.test(sanitized) || /^2[2-7]/.test(sanitized)) {
    return 'mastercard';
  }

  // American Express
  if (/^3[47]/.test(sanitized)) {
    return 'amex';
  }

  // Discover
  if (/^6/.test(sanitized)) {
    return 'discover';
  }

  return 'unknown';
};

// Format card number for display (mask sensitive digits)
export const formatCardNumberForDisplay = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\D/g, '');

  if (sanitized.length < 4) {
    return cardNumber;
  }

  // Show only last 4 digits
  const masked = '*'.repeat(sanitized.length - 4) + sanitized.slice(-4);

  // Add spaces every 4 digits
  return masked.replace(/(.{4})/g, '$1 ').trim();
};

// Validate form data for payment methods
export const validatePaymentMethodForm = (data: {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate card number
  const cardValidation = validateCreditCardNumber(data.cardNumber);
  if (!cardValidation.isValid) {
    errors.cardNumber = cardValidation.error!;
  }

  // Validate expiry
  const expiryValidation = validateCardExpiry(data.expiryMonth, data.expiryYear);
  if (!expiryValidation.isValid) {
    errors.expiry = expiryValidation.error!;
  }

  // Validate CVV
  const cardType = detectCardType(data.cardNumber);
  const cvvValidation = validateCVV(data.cvv, cardType);
  if (!cvvValidation.isValid) {
    errors.cvv = cvvValidation.error!;
  }

  // Validate holder name
  if (!data.holderName || data.holderName.trim().length < 2) {
    errors.holderName = 'Card holder name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Rate limiting utility (client-side)
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  public canMakeRequest(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || now > entry.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  public getRemainingAttempts(key: string, maxAttempts: number = 5): number {
    const entry = this.attempts.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - entry.count);
  }
}

export const rateLimiter = new RateLimiter();