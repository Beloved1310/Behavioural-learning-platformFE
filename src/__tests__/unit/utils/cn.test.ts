import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn Utility - Unit Tests', () => {
  describe('Basic Usage', () => {
    it('should combine class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle single class name', () => {
      const result = cn('single-class');
      expect(result).toBe('single-class');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('Conditional Classes', () => {
    it('should include class when condition is true', () => {
      const result = cn('base', true && 'conditional');
      expect(result).toBe('base conditional');
    });

    it('should exclude class when condition is false', () => {
      const result = cn('base', false && 'conditional');
      expect(result).toBe('base');
    });

    it('should handle multiple conditions', () => {
      const result = cn('base', true && 'class1', false && 'class2', true && 'class3');
      expect(result).toBe('base class1 class3');
    });
  });

  describe('Object Syntax', () => {
    it('should include class when object value is true', () => {
      const result = cn({ 'active': true, 'disabled': false });
      expect(result).toBe('active');
    });

    it('should exclude class when object value is false', () => {
      const result = cn({ 'active': false });
      expect(result).toBe('');
    });

    it('should handle mixed object and string inputs', () => {
      const result = cn('base', { 'active': true, 'disabled': false }, 'extra');
      expect(result).toBe('base active extra');
    });
  });

  describe('Array Syntax', () => {
    it('should handle array of class names', () => {
      const result = cn(['class1', 'class2', 'class3']);
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle array with conditions', () => {
      const result = cn(['base', true && 'conditional']);
      expect(result).toBe('base conditional');
    });

    it('should handle nested arrays', () => {
      const result = cn(['base', ['nested1', 'nested2']]);
      expect(result).toBe('base nested1 nested2');
    });
  });

  describe('Complex Combinations', () => {
    it('should handle string, object, and array together', () => {
      const result = cn('base', { 'active': true }, ['array1', 'array2']);
      expect(result).toBe('base active array1 array2');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('should handle empty strings', () => {
      const result = cn('base', '', 'valid');
      expect(result).toBe('base valid');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should combine Tailwind classes', () => {
      const result = cn('px-4 py-2', 'bg-blue-500', { 'text-white': true, 'opacity-50': false });
      expect(result).toBe('px-4 py-2 bg-blue-500 text-white');
    });

    it('should handle conditional styling', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'button',
        {
          'button-active': isActive,
          'button-disabled': isDisabled,
        }
      );
      expect(result).toBe('button button-active');
    });

    it('should merge className props', () => {
      const baseClasses = 'base-class';
      const propClasses = 'prop-class';
      const result = cn(baseClasses, propClasses);
      expect(result).toBe('base-class prop-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all falsy values', () => {
      const result = cn(false, null, undefined, 0, '');
      expect(result).toBe('');
    });

    it('should handle numbers', () => {
      const result = cn('class', 0, 1);
      // clsx includes truthy numbers (1) but ignores falsy (0)
      expect(result).toBe('class 1');
    });

    it('should handle very long class lists', () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...classes);
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
    });
  });
});

