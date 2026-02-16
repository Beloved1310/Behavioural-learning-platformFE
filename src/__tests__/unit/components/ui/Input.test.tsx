import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/testUtils';
import { Input } from '@/components/ui/Input';

describe('Input Component - Unit Tests', () => {
  describe('Rendering', () => {
    it('should render input without label', () => {
      renderWithProviders(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render input with label', () => {
      renderWithProviders(<Input label="Email" />);
      // #region agent log
      const labelEl = document.querySelector('label');
      const inputEl = document.querySelector('input');
      fetch('http://127.0.0.1:7242/ingest/29db3bdb-d0c4-41dc-8767-0e7eb475c23f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.test.tsx:16',message:'Test render check - post fix',data:{labelExists:!!labelEl,labelHtmlFor:labelEl?.getAttribute('for'),inputExists:!!inputEl,inputId:inputEl?.getAttribute('id'),labelText:labelEl?.textContent},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should render input with error message', () => {
      renderWithProviders(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
    });

    it('should render input with helper text', () => {
      renderWithProviders(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address')).toHaveClass('text-gray-500');
    });

    it('should not show helper text when error is present', () => {
      renderWithProviders(
        <Input error="Error message" helperText="Helper text" />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should apply error styling when error is present', () => {
      renderWithProviders(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300');
    });

    it('should not apply error styling when error is not present', () => {
      renderWithProviders(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-300');
    });
  });

  describe('ID and Name Attributes', () => {
    it('should use id prop when provided', () => {
      renderWithProviders(<Input id="email-input" label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should use name prop as id when id is not provided', () => {
      renderWithProviders(<Input name="email" label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('should associate label with input via htmlFor', () => {
      renderWithProviders(<Input id="test-input" label="Test Input" />);
      const label = screen.getByText('Test Input');
      expect(label).toHaveAttribute('for', 'test-input');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      renderWithProviders(<Input />);
      const input = document.querySelector('input');
      expect(input).toBeInTheDocument();
      // Input type defaults to "text" in HTML, but React may not render it explicitly
      expect(input?.getAttribute('type') || 'text').toBe('text');
    });

    it('should render email input when type is email', () => {
      renderWithProviders(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render number input when type is number', () => {
      renderWithProviders(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render tel input when type is tel', () => {
      renderWithProviders(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Interactions', () => {
    it('should allow typing into input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Input label="Name" name="name" />);
      const input = screen.getByLabelText('Name') as HTMLInputElement;

      await user.type(input, 'John Doe');
      expect(input.value).toBe('John Doe');
    });

    it('should call onChange handler when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<Input onChange={handleChange} label="Name" name="name" />);
      const input = screen.getByLabelText('Name') as HTMLInputElement;

      await user.type(input, 'Test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle placeholder text', () => {
      renderWithProviders(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      renderWithProviders(<Input disabled label="Disabled Input" name="disabled" />);
      const input = screen.getByLabelText('Disabled Input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should handle readonly state', () => {
      renderWithProviders(<Input readOnly label="Readonly Input" name="readonly" />);
      const input = screen.getByLabelText('Readonly Input') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it('should handle required attribute', () => {
      renderWithProviders(<Input required label="Required Input" name="required" />);
      const input = screen.getByLabelText('Required Input') as HTMLInputElement;
      expect(input.required).toBe(true);
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to input', () => {
      renderWithProviders(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should merge custom className with default classes', () => {
      renderWithProviders(<Input className="custom-class" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('custom-class');
      expect(input.className).toContain('border-red-300');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      renderWithProviders(<Input id="accessible-input" label="Accessible Input" />);
      const label = screen.getByText('Accessible Input');
      const input = screen.getByLabelText('Accessible Input');
      expect(label).toHaveAttribute('for', 'accessible-input');
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('should support aria attributes', () => {
      renderWithProviders(
        <Input aria-label="Email address" aria-describedby="email-help" />
      );
      const input = screen.getByLabelText('Email address');
      expect(input).toHaveAttribute('aria-label', 'Email address');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should support aria-invalid when error is present', () => {
      renderWithProviders(<Input error="Error message" aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as error', () => {
      renderWithProviders(<Input error="" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longError = 'A'.repeat(200);
      renderWithProviders(<Input error={longError} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      renderWithProviders(<Input label="Email & Password (required)" name="emailPassword" />);
      const input = screen.getByLabelText(/email.*password.*required/i);
      expect(input).toBeInTheDocument();
    });
  });
});

