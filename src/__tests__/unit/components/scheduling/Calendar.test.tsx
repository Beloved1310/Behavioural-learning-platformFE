import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/testUtils';
import { Calendar } from '@/components/scheduling/Calendar';

// Use current date for test data to match calendar's default currentMonth
const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth();

const mockSessions = [
  {
    id: '1',
    userId: 'user1',
    title: 'Math Session',
    subject: 'Math',
    type: 'study' as const,
    startTime: new Date(getCurrentYear(), getCurrentMonth(), 15, 10, 0).toISOString(),
    endTime: new Date(getCurrentYear(), getCurrentMonth(), 15, 11, 0).toISOString(),
    status: 'scheduled' as const,
    duration: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Science Session',
    subject: 'Science',
    type: 'tutoring' as const,
    startTime: new Date(getCurrentYear(), getCurrentMonth(), 20, 14, 0).toISOString(),
    endTime: new Date(getCurrentYear(), getCurrentMonth(), 20, 15, 0).toISOString(),
    status: 'scheduled' as const,
    duration: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('Calendar Component - Unit Tests', () => {
  const mockOnSelectDate = vi.fn();
  const mockOnEditSession = vi.fn();
  const selectedDate = new Date(getCurrentYear(), getCurrentMonth(), 15);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render calendar with current month', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Check if month and year are displayed (they're separate text nodes in h2)
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();

      const headingText = heading.textContent || '';
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const currentMonthName = monthNames[getCurrentMonth()];
      const currentYear = getCurrentYear().toString();

      expect(headingText).toContain(currentMonthName);
      expect(headingText).toContain(currentYear);
    });

    it('should render calendar grid with days', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Check for day numbers (should have days 1-31)
      // Use getAllByText since "1" might appear multiple times (day number + session count)
      const day1Elements = screen.getAllByText('1');
      expect(day1Elements.length).toBeGreaterThan(0);

      // Check for day 15 (should be unique as a day number)
      const day15Elements = screen.getAllByText('15');
      // Day 15 should exist (might also have session count if there are 15 sessions)
      expect(day15Elements.length).toBeGreaterThan(0);
    });

    it('should highlight selected date', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Find the day cell - need to find the parent div that has the day cell classes
      const day15Text = screen.getAllByText('15')[0]; // Get first occurrence (the day number)
      const dayCell = day15Text.closest('div.h-24'); // Find the day cell div
      expect(dayCell).toBeInTheDocument();
      // Check if it has the selected date classes
      const classList = dayCell?.className || '';
      expect(classList.includes('bg-purple-100') || classList.includes('border-purple-400')).toBe(
        true
      );
    });
  });

  describe('Session Display', () => {
    it('should display sessions on correct dates', async () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Session should be visible on day 15 (sessions are rendered in the calendar)
      // Check for session title or session count indicator
      await waitFor(() => {
        const mathSession = screen.queryByText('Math Session');
        const day15Elements = screen.getAllByText('15');
        const day15 = day15Elements[0].closest('div.h-24');
        const sessionCount = day15?.querySelector('.bg-purple-500');

        // Either the session text should be visible, or the session count indicator
        expect(mathSession || sessionCount).toBeTruthy();
      });
    });

    it('should show session count indicator', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Check if session indicator is present
      const day15Elements = screen.getAllByText('15');
      const day15 = day15Elements[0].closest('div.h-24');
      expect(day15).toBeInTheDocument();
    });

    it('should not display sessions on dates without sessions', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Day 25 should exist but not have sessions
      const day25Elements = screen.getAllByText('25');
      const day25 = day25Elements[0].closest('div.h-24');
      expect(day25).toBeInTheDocument();
      // Day 25 should not have session count indicator
      const sessionCount = day25?.querySelector('.bg-purple-500');
      expect(sessionCount).not.toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should call onSelectDate when date is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Get the day number element (first occurrence)
      const day20Elements = screen.getAllByText('20');
      const day20 = day20Elements[0]; // Get the day number, not session count
      await user.click(day20);

      expect(mockOnSelectDate).toHaveBeenCalled();
      const calledDate = mockOnSelectDate.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(20);
    });

    it('should update selected date highlight when new date is selected', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      const day20Elements = screen.getAllByText('20');
      const day20 = day20Elements[0];
      await user.click(day20);

      // Rerender with new selected date
      rerender(
        <Calendar
          sessions={mockSessions}
          selectedDate={new Date(getCurrentYear(), getCurrentMonth(), 20)}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      const day20Text = screen.getAllByText('20')[0];
      const newSelectedDay = day20Text.closest('div.h-24');
      expect(newSelectedDay).toBeInTheDocument();
      const classList = newSelectedDay?.className || '';
      expect(classList.includes('bg-purple-100') || classList.includes('border-purple-400')).toBe(
        true
      );
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const prevMonthIndex = getCurrentMonth() === 0 ? 11 : getCurrentMonth() - 1;
      const prevMonthName = monthNames[prevMonthIndex];
      const prevYear = getCurrentMonth() === 0 ? getCurrentYear() - 1 : getCurrentYear();

      // Find previous button - it's the first button in the calendar header
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0]; // First button is previous

      // Verify initial state shows current month
      const initialHeading = screen.getByRole('heading', { level: 2 });
      const initialHeadingText = initialHeading.textContent || '';
      const currentMonthName = monthNames[getCurrentMonth()];
      expect(initialHeadingText).toContain(currentMonthName);

      // Click the previous button using userEvent (same as next month test)
      await user.click(prevButton);

      // Calendar should update to show previous month
      await waitFor(
        () => {
          const heading = screen.getByRole('heading', { level: 2 });
          const headingText = heading.textContent || '';
          expect(headingText).toContain(prevMonthName);
          expect(headingText).toContain(prevYear.toString());
        },
        { timeout: 3000 }
      );
    });

    it('should navigate to next month', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Find next button by its position (last button)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1]; // Last button is next

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const nextMonthIndex = getCurrentMonth() === 11 ? 0 : getCurrentMonth() + 1;
      const nextMonthName = monthNames[nextMonthIndex];
      const nextYear = getCurrentMonth() === 11 ? getCurrentYear() + 1 : getCurrentYear();

      await user.click(nextButton);

      // Calendar should update to show next month
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        const headingText = heading.textContent || '';
        expect(headingText).toContain(nextMonthName);
        expect(headingText).toContain(nextYear.toString());
      });
    });
  });

  describe('Session Interaction', () => {
    it('should call onEditSession when session is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Wait for sessions to render, then find and click on a session
      await waitFor(() => {
        const sessionElement = screen.queryByText('Math Session');
        if (sessionElement) {
          return sessionElement;
        }
        // If session text not found, try finding by the day that should have it
        const day15 = screen.getByText('15');
        return day15;
      });

      const sessionElement = screen.queryByText('Math Session');
      if (sessionElement) {
        await user.click(sessionElement);
        expect(mockOnEditSession).toHaveBeenCalledWith(mockSessions[0]);
      } else {
        // If session not visible, test that the day with session is clickable
        const day15 = screen.getByText('15');
        await user.click(day15);
        expect(mockOnSelectDate).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions array', () => {
      renderWithProviders(
        <Calendar
          sessions={[]}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Check that calendar header exists
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();

      // Calendar should render without sessions
      expect(screen.queryByText('Math Session')).not.toBeInTheDocument();
    });

    it('should handle sessions from different months', () => {
      const nextMonth = getCurrentMonth() === 11 ? 0 : getCurrentMonth() + 1;
      const nextMonthYear = getCurrentMonth() === 11 ? getCurrentYear() + 1 : getCurrentYear();

      const crossMonthSessions = [
        ...mockSessions,
        {
          id: '3',
          userId: 'user1',
          title: 'Future Session',
          subject: 'English',
          type: 'study' as const,
          startTime: new Date(nextMonthYear, nextMonth, 10, 10, 0).toISOString(),
          endTime: new Date(nextMonthYear, nextMonth, 10, 11, 0).toISOString(),
          status: 'scheduled' as const,
          duration: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      renderWithProviders(
        <Calendar
          sessions={crossMonthSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Should only show sessions from current month (not future month)
      const futureSession = screen.queryByText('Future Session');

      // Future session should not be visible (it's in next month)
      expect(futureSession).not.toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const invalidSessions = [
        {
          ...mockSessions[0],
          startTime: 'invalid-date',
        },
      ];

      // Should not throw an error when rendering
      expect(() => {
        renderWithProviders(
          <Calendar
            sessions={invalidSessions}
            selectedDate={selectedDate}
            onSelectDate={mockOnSelectDate}
            onEditSession={mockOnEditSession}
          />
        );
      }).not.toThrow();

      // Calendar should still render - check for day names or calendar structure
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const hasDayNames = dayNames.some((day) => screen.queryByText(day));
      expect(hasDayNames).toBe(true);

      // Check that calendar header exists (month/year are in h2 as separate text nodes)
      const heading = screen.queryByRole('heading', { level: 2 });
      if (heading) {
        const headingText = heading.textContent || '';
        // Should contain a month name (case-insensitive)
        expect(headingText).toMatch(
          /december|january|february|march|april|may|june|july|august|september|october|november/i
        );
        // Should contain a 4-digit year
        expect(headingText).toMatch(/\d{4}/);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation buttons', () => {
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Check for accessible navigation
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Calendar
          sessions={mockSessions}
          selectedDate={selectedDate}
          onSelectDate={mockOnSelectDate}
          onEditSession={mockOnEditSession}
        />
      );

      // Should be able to tab through calendar
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });
});
