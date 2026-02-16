import React, { useState, useEffect } from 'react';

interface Session {
  userId: string;
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  tutor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'confirmed' | 'pending';
  isRecurring?: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleFormProps {
  onSubmit?: (sessionData: Partial<Session>) => void;
  onUpdate?: (sessionId: string, sessionData: Partial<Session>) => void;
  onCancel?: () => void;
  editingSession?: Session | null;
}

// Kid-friendly Calendar Picker Component
interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

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
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(newMonth);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const isPast = isPastDate(date);

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => !isPast && onSelectDate(date)}
          className={`h-10 rounded-lg font-bold text-sm transition-all transform ${
            isPast
              ? 'text-gray-300 cursor-not-allowed'
              : isSelected
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-md'
                : isToday
                  ? 'bg-yellow-200 text-purple-900 border-2 border-yellow-400 hover:scale-105'
                  : 'text-purple-900 hover:bg-purple-100 hover:scale-105 border border-transparent hover:border-purple-300'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-purple-300 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-1.5 rounded-full hover:bg-purple-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 className="text-base font-bold text-purple-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-1.5 rounded-full hover:bg-purple-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-purple-700">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  );
};

// Kid-friendly Time Picker Component
interface TimePickerProps {
  selectedTime: { hour: number; minute: number } | null;
  onSelectTime: (hour: number, minute: number) => void;
  label: string;
  icon: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ selectedTime, onSelectTime, label, icon }) => {
  const [selectedHour, setSelectedHour] = useState(selectedTime?.hour || 9);
  const [selectedMinute, setSelectedMinute] = useState(selectedTime?.minute || 0);
  const [isPM, setIsPM] = useState(selectedTime ? selectedTime.hour >= 12 : false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  useEffect(() => {
    const hour24 = isPM
      ? selectedHour === 12
        ? 12
        : selectedHour + 12
      : selectedHour === 12
        ? 0
        : selectedHour;
    onSelectTime(hour24, selectedMinute);
  }, [selectedHour, selectedMinute, isPM]);

  return (
    <div className="bg-white rounded-xl border-2 border-purple-300 p-3 shadow-lg">
      <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center">
        <span className="text-xl mr-2">{icon}</span>
        {label}
      </h3>

      <div className="space-y-3">
        {/* Hour Selection */}
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1.5 block">
            Pick the Hour:
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {hours.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => setSelectedHour(hour)}
                className={`py-2 rounded-lg font-bold text-base transition-all transform hover:scale-105 ${
                  selectedHour === hour
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        {/* Minute Selection */}
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1.5 block">
            Pick the Minutes:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {minutes.map((minute) => (
              <button
                key={minute}
                type="button"
                onClick={() => setSelectedMinute(minute)}
                className={`py-2 rounded-lg font-bold text-base transition-all transform hover:scale-105 ${
                  selectedMinute === minute
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                :{minute.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* AM/PM Toggle */}
        <div>
          <label className="text-xs font-semibold text-purple-700 mb-1.5 block">
            Morning or Afternoon?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPM(false)}
              className={`py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                !isPM
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md scale-105'
                  : 'bg-yellow-50 text-yellow-900 hover:bg-yellow-100 border border-yellow-300'
              }`}
            >
              ☀️ AM
            </button>
            <button
              type="button"
              onClick={() => setIsPM(true)}
              className={`py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                isPM
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              🌙 PM
            </button>
          </div>
        </div>

        {/* Time Display */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border-2 border-purple-300 text-center">
          <p className="text-xs text-purple-700 font-semibold mb-1">Selected Time:</p>
          <p className="text-2xl font-bold text-purple-900">
            {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {isPM ? 'PM' : 'AM'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  onUpdate,
  onCancel,
  editingSession,
}) => {
  const [formData, setFormData] = useState<Partial<Session>>({
    title: '',
    subject: '',
    type: 'study',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    reminderEnabled: true,
    reminderTime: 15,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for kid-friendly date/time pickers
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ hour: number; minute: number } | null>(null);
  const [endTime, setEndTime] = useState<{ hour: number; minute: number } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  useEffect(() => {
    if (editingSession) {
      setFormData({
        title: editingSession.title,
        subject: editingSession.subject,
        type: editingSession.type,
        startTime: editingSession.startTime,
        endTime: editingSession.endTime,
        isRecurring: editingSession.isRecurring || false,
        recurringPattern: editingSession.recurringPattern || 'weekly',
        reminderEnabled: editingSession.reminderEnabled ?? true,
        reminderTime: editingSession.reminderTime ?? 15,
        description: editingSession.description || '',
      });

      // Initialize kid-friendly pickers with editing session data
      if (editingSession.startTime) {
        const startDate = new Date(editingSession.startTime);
        setSelectedDate(startDate);
        setStartTime({ hour: startDate.getHours(), minute: startDate.getMinutes() });
      }
      if (editingSession.endTime) {
        const endDate = new Date(editingSession.endTime);
        setEndTime({ hour: endDate.getHours(), minute: endDate.getMinutes() });
      }
    }
  }, [editingSession]);

  // Sync kid-friendly pickers with form data
  useEffect(() => {
    if (selectedDate && startTime) {
      const dateTime = new Date(selectedDate);
      dateTime.setHours(startTime.hour, startTime.minute, 0, 0);
      handleChange('startTime', dateTime.toISOString());
    }
  }, [selectedDate, startTime]);

  useEffect(() => {
    if (selectedDate && endTime) {
      const dateTime = new Date(selectedDate);
      dateTime.setHours(endTime.hour, endTime.minute, 0, 0);
      handleChange('endTime', dateTime.toISOString());
    }
  }, [selectedDate, endTime]);

  const subjects = [
    { id: 'math', label: 'Fun with Numbers 🔢', color: 'purple' },
    { id: 'reading', label: 'Reading Adventures 📖', color: 'blue' },
    { id: 'science', label: 'Science Explorers 🔬', color: 'green' },
    { id: 'history', label: 'World Discoveries 🌍', color: 'orange' },
    { id: 'art', label: 'Creative Arts 🎨', color: 'pink' },
    { id: 'music', label: 'Music & Sounds 🎵', color: 'yellow' },
    { id: 'general', label: 'General Learning 📚', color: 'gray' },
  ];

  const sessionTypes = [
    { id: 'study', label: 'Self Study 📚', description: 'Learn on your own', icon: '📚' },
    { id: 'reading', label: 'Reading Time 📖', description: 'Read amazing stories', icon: '📖' },
    { id: 'quiz', label: 'Fun Quiz 🧠', description: 'Test your knowledge', icon: '🧠' },
    { id: 'tutoring', label: 'Tutor Session 👨‍🏫', description: 'Learn with a teacher', icon: '👨‍🏫' },
  ];

  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
  ];

  const recurringPatterns = [
    { value: 'daily', label: 'Every day', icon: '📅' },
    { value: 'weekly', label: 'Every week', icon: '🗓️' },
    { value: 'monthly', label: 'Every month', icon: '📆' },
  ];

  const durationOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hr', value: 60 },
    { label: '1.5 hrs', value: 90 },
    { label: '2 hrs', value: 120 },
    { label: '3 hrs', value: 180 },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Please give your session a fun name!';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please pick a subject you want to learn!';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'When do you want to start learning?';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'When will you finish?';
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time!';
      }

      if (startTime < new Date()) {
        newErrors.startTime = "You can't schedule sessions in the past!";
      }

      // Validate duration (must be between 15 and 180 minutes)
      const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      if (durationInMinutes < 15) {
        newErrors.endTime = 'Sessions must be at least 15 minutes long!';
      } else if (durationInMinutes > 180) {
        newErrors.endTime = 'Sessions cannot be longer than 3 hours!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingSession && onUpdate) {
      onUpdate(editingSession.id, formData);
    } else if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof Session, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const getDefaultEndTime = (startTime: string) => {
    if (!startTime) return '';

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 45); // Default 45-minute sessions

    return end.toISOString();
  };

  const setEndTimeFromDuration = (duration: number) => {
    if (!startTime || !selectedDate) return;

    const start = new Date(selectedDate);
    start.setHours(startTime.hour, startTime.minute, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    setEndTime({ hour: end.getHours(), minute: end.getMinutes() });
  };

  // Format datetime for input (converts from ISO to local datetime-local format)
  const formatDateTimeForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Get local timezone offset
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Convert from datetime-local input to ISO string
  const convertToISOString = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return '';
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Title */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            What's your learning adventure called? 🌟
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Math Magic Time, Science Discovery..."
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            What subject will you explore? 📚
          </label>
          <div className="grid grid-cols-1 gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => handleChange('subject', subject.id)}
                className={`p-3 text-left rounded-xl border-2 transition-all ${
                  formData.subject === subject.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <span className="font-medium">{subject.label}</span>
              </button>
            ))}
          </div>
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            How do you want to learn? 🎯
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleChange('type', type.id)}
                className={`p-3 text-center rounded-xl border-2 transition-all ${
                  formData.type === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time - Kid-Friendly Pickers */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📅</span>
            When's Your Learning Adventure?
          </h3>

          {errors.startTime && (
            <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-xl p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-bold text-red-900">{errors.startTime}</p>
            </div>
          )}

          {errors.endTime && (
            <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-xl p-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-bold text-red-900">{errors.endTime}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1: Pick a Date */}
            <div>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <span className="text-3xl mr-3">📅</span>
                  {selectedDate ? (
                    <span>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span>Step 1: Pick a Day!</span>
                  )}
                </span>
                <svg
                  className={`w-6 h-6 transition-transform ${showCalendar ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCalendar && (
                <div className="mt-4 animate-fadeIn">
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                      setSelectedDate(date);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Step 2: Pick Start Time */}
            {selectedDate && (
              <div className="animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setShowStartTime(!showStartTime)}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <span className="text-3xl mr-3">⏰</span>
                    {startTime ? (
                      <span>
                        Start:{' '}
                        {startTime.hour > 12
                          ? startTime.hour - 12
                          : startTime.hour === 0
                            ? 12
                            : startTime.hour}
                        :{startTime.minute.toString().padStart(2, '0')}{' '}
                        {startTime.hour >= 12 ? 'PM' : 'AM'}
                      </span>
                    ) : (
                      <span>Step 2: Pick Start Time!</span>
                    )}
                  </span>
                  <svg
                    className={`w-6 h-6 transition-transform ${showStartTime ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showStartTime && (
                  <div className="mt-4 animate-fadeIn">
                    <TimePicker
                      selectedTime={startTime}
                      onSelectTime={(hour, minute) => setStartTime({ hour, minute })}
                      label="What time do you start?"
                      icon="⏰"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStartTime(false)}
                      className="w-full mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                      ✅ Done!
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pick End Time */}
            {selectedDate && startTime && (
              <div className="animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setShowEndTime(!showEndTime)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <span className="text-3xl mr-3">🏁</span>
                    {endTime ? (
                      <span>
                        End:{' '}
                        {endTime.hour > 12
                          ? endTime.hour - 12
                          : endTime.hour === 0
                            ? 12
                            : endTime.hour}
                        :{endTime.minute.toString().padStart(2, '0')}{' '}
                        {endTime.hour >= 12 ? 'PM' : 'AM'}
                      </span>
                    ) : (
                      <span>Step 3: Pick End Time!</span>
                    )}
                  </span>
                  <svg
                    className={`w-6 h-6 transition-transform ${showEndTime ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showEndTime && (
                  <div className="mt-4 animate-fadeIn">
                    <TimePicker
                      selectedTime={endTime}
                      onSelectTime={(hour, minute) => setEndTime({ hour, minute })}
                      label="What time do you finish?"
                      icon="🏁"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEndTime(false)}
                      className="w-full mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                      ✅ Done!
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Duration Display */}
            {selectedDate && startTime && endTime && !errors.startTime && !errors.endTime && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border-2 border-purple-300 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">⏱️</span>
                    <span className="font-bold text-purple-900 text-lg">Your Session:</span>
                  </div>
                  <div className="bg-white px-5 py-3 rounded-full border-2 border-purple-400 shadow-md">
                    <span className="text-xl font-black text-purple-700">
                      {(() => {
                        if (!formData.startTime || !formData.endTime) return '0m';
                        const start = new Date(formData.startTime);
                        const end = new Date(formData.endTime);
                        const duration = Math.round(
                          (end.getTime() - start.getTime()) / (1000 * 60)
                        );
                        const hours = Math.floor(duration / 60);
                        const minutes = duration % 60;
                        if (hours > 0) {
                          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                        }
                        return `${minutes}m`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Duration Selector */}
        {selectedDate && startTime && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-300 shadow-md animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-purple-900 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Quick Time Buttons!
              </h3>
            </div>
            <p className="text-sm text-amber-800 mb-4 font-semibold">
              How long do you want to learn? Just click a button below!
            </p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {durationOptions.map((option) => {
                const isActive =
                  formData.startTime &&
                  formData.endTime &&
                  Math.round(
                    (new Date(formData.endTime).getTime() -
                      new Date(formData.startTime).getTime()) /
                      (1000 * 60)
                  ) === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEndTimeFromDuration(option.value)}
                    className={`relative px-3 py-3 text-sm font-bold rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                        : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-50 hover:border-purple-500'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold">{option.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 bg-white rounded-lg p-3 border border-yellow-300">
              <p className="text-xs text-amber-700 font-medium text-center flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                These buttons will automatically set your end time for you!
              </p>
            </div>
          </div>
        )}

        {/* Recurring Sessions */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-purple-900">
              Do you want to repeat this session? 🔄
            </label>
            <button
              type="button"
              onClick={() => handleChange('isRecurring', !formData.isRecurring)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                formData.isRecurring ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  formData.isRecurring ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {recurringPatterns.map((pattern) => (
                <button
                  key={pattern.value}
                  type="button"
                  onClick={() => handleChange('recurringPattern', pattern.value)}
                  className={`p-2 text-center rounded-lg border transition-all ${
                    formData.recurringPattern === pattern.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-lg mb-1">{pattern.icon}</div>
                  <div className="text-xs font-medium">{pattern.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-purple-900">
              Do you want reminders? 🔔
            </label>
            <button
              type="button"
              onClick={() => handleChange('reminderEnabled', !formData.reminderEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                formData.reminderEnabled ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  formData.reminderEnabled ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {formData.reminderEnabled && (
            <select
              value={formData.reminderTime || 15}
              onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mt-2"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            Tell us more about your adventure! 📝 (Optional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What are you excited to learn? Any special goals?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            {editingSession ? '✨ Update Session' : '🚀 Create Adventure!'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
