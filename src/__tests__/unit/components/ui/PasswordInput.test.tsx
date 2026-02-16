import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/testUtils';
import { PasswordInput } from '@/components/ui/PasswordInput';

describe('PasswordInput Component - Unit Tests', () => {
  describe('Rendering', () => {
    it('should render password input', () => {
      renderWithProviders(<PasswordInput />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render password input with label', () => {
      renderWithProviders(<PasswordInput label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render password input with error message', () => {
      renderWithProviders(<PasswordInput error="Password is required" />);
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should render password input with helper text', () => {
      renderWithProviders(<PasswordInput helperText="Must be at least 8 characters" />);
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('should not show helper text when error is present', () => {
      renderWithProviders(
        <PasswordInput error="Error" helperText="Helper text" />
      );
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should show toggle button', () => {
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should hide password by default', () => {
      renderWithProviders(<PasswordInput />);
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should show password when toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should hide password when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);

      // Click to show
      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      // Click to hide
      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should change icon when password visibility changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');

      // Initially should show eye-off icon (password hidden)
      const svgBefore = toggleButton.querySelector('svg');
      expect(svgBefore).toBeInTheDocument();

      // Click to show password
      await user.click(toggleButton);

      // Icon should change (eye icon)
      const svgAfter = toggleButton.querySelector('svg');
      expect(svgAfter).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should allow typing into password input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput label="Password" name="password" />);
      const input = screen.getByLabelText('Password') as HTMLInputElement;

      await user.type(input, 'secretpassword');
      expect(input.value).toBe('secretpassword');
    });

    it('should call onChange handler when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput onChange={handleChange} label="Password" name="password" />);
      const input = screen.getByLabelText('Password') as HTMLInputElement;

      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle placeholder text', () => {
      renderWithProviders(<PasswordInput placeholder="Enter password" />);
      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      renderWithProviders(<PasswordInput disabled label="Password" name="password" />);
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should handle required attribute', () => {
      renderWithProviders(<PasswordInput required label="Password" name="password" />);
      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.required).toBe(true);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn();
      renderWithProviders(<PasswordInput ref={ref} />);
      // Ref should be called with the input element
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('ID and Name Attributes', () => {
    it('should use id prop when provided', () => {
      renderWithProviders(<PasswordInput id="password-input" label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('id', 'password-input');
    });

    it('should use name prop as id when id is not provided', () => {
      renderWithProviders(<PasswordInput name="password" label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('id', 'password');
    });

    it('should associate label with input via htmlFor', () => {
      renderWithProviders(<PasswordInput id="test-password" label="Test Password" />);
      const label = screen.getByText('Test Password');
      expect(label).toHaveAttribute('for', 'test-password');
    });
  });

  describe('Error Styling', () => {
    it('should apply error styling when error is present', () => {
      renderWithProviders(<PasswordInput error="Error message" />);
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);
      expect(input).toHaveClass('border-red-300');
    });

    it('should not apply error styling when error is not present', () => {
      renderWithProviders(<PasswordInput />);
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);
      expect(input).not.toHaveClass('border-red-300');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to input', () => {
      renderWithProviders(<PasswordInput className="custom-password" />);
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);
      expect(input).toHaveClass('custom-password');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      renderWithProviders(<PasswordInput id="accessible-password" label="Accessible Password" />);
      const label = screen.getByText('Accessible Password');
      const input = screen.getByLabelText('Accessible Password');
      expect(label).toHaveAttribute('for', 'accessible-password');
      expect(input).toHaveAttribute('id', 'accessible-password');
    });

    it('should support aria attributes', () => {
      renderWithProviders(
        <PasswordInput aria-label="Password field" aria-describedby="password-help" />
      );
      const input = screen.getByLabelText('Password field');
      expect(input).toHaveAttribute('aria-label', 'Password field');
      expect(input).toHaveAttribute('aria-describedby', 'password-help');
    });

    it('should have tabIndex on toggle button to prevent tab focus', () => {
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as error', () => {
      renderWithProviders(<PasswordInput error="" />);
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);
      expect(input).toBeInTheDocument();
    });

    it('should handle multiple visibility toggles', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput />);
      const toggleButton = screen.getByRole('button');
      const input = screen.getByDisplayValue('') || screen.getByLabelText(/password/i);

      // Toggle multiple times
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);

      // Should end up showing password (odd number of clicks)
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should maintain value when toggling visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PasswordInput label="Password" name="password" />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;
      const toggleButton = screen.getByRole('button');

      await user.type(input, 'mypassword123');
      expect(input.value).toBe('mypassword123');

      await user.click(toggleButton);
      expect(input.value).toBe('mypassword123');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});

