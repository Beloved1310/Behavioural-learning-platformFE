import React, { useState, useEffect } from 'react';
import {
  tutorAvailabilityService,
  TutorAvailabilitySlot,
} from '../../services/tutorAvailabilityService';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export const TutorCalendarAvailability: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [availabilities, setAvailabilities] = useState<TutorAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<Partial<TutorAvailabilitySlot>>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      console.log('[TutorCalendarAvailability] Loading availability...');
      const data = await tutorAvailabilityService.getAvailability();
      console.log('[TutorCalendarAvailability] Loaded availability:', data);
      setAvailabilities(data || []);
    } catch (error: any) {
      console.error('[TutorCalendarAvailability] Failed to load availability:', error);
      showError(error?.message || 'Failed to load availability. Please try again.');
      setAvailabilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (availabilities.length === 0) {
      showWarning('Please add at least one availability slot before saving.');
      return;
    }

    try {
      setSaving(true);
      console.log(
        '[TutorCalendarAvailability] Saving availability - count:',
        availabilities.length
      );
      console.log(
        '[TutorCalendarAvailability] Full availability array:',
        JSON.stringify(availabilities, null, 2)
      );

      // Remove id field from slots that don't have it (new slots)
      const slotsToSave = availabilities.map((slot) => {
        const cleaned = {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isRecurring: slot.isRecurring !== false,
          specificDate: slot.specificDate,
        };
        console.log('[TutorCalendarAvailability] Mapped slot:', cleaned);
        return cleaned;
      });

      console.log(
        '[TutorCalendarAvailability] Slots to save (final):',
        JSON.stringify(slotsToSave, null, 2)
      );
      console.log('[TutorCalendarAvailability] Slots to save count:', slotsToSave.length);

      const saved = await tutorAvailabilityService.setAvailability(slotsToSave);
      console.log('[TutorCalendarAvailability] Saved availability response:', saved);
      console.log('[TutorCalendarAvailability] Saved availability count:', saved?.length || 0);

      if (!saved || saved.length === 0) {
        console.error('[TutorCalendarAvailability] WARNING: Save returned empty array!');
        showWarning(
          'Warning: Availability was saved but returned empty. Please refresh and check.'
        );
      }

      // Reload availability to get the IDs from server
      await loadAvailability();
      showSuccess('Availability saved successfully!');
    } catch (error: any) {
      console.error('[TutorCalendarAvailability] Failed to save availability:', error);
      console.error('[TutorCalendarAvailability] Error details:', error.message, error.stack);
      showError(error?.message || 'Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime) {
      showWarning('Please fill in all fields');
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      showWarning('Start time must be before end time');
      return;
    }

    const slot: TutorAvailabilitySlot = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isRecurring: newSlot.isRecurring !== false,
      specificDate: newSlot.specificDate,
    };

    setAvailabilities([...availabilities, slot]);
    setNewSlot({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
    });
    setShowAddForm(false);
  };

  const handleDeleteSlot = (index: number) => {
    if (confirm('Are you sure you want to delete this availability slot?')) {
      const updated = availabilities.filter((_, i) => i !== index);
      setAvailabilities(updated);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || 'Unknown';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-900">Set Your Availability</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Availability'}</span>
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Set your weekly availability. Students will only be able to book sessions during these
        times.
      </p>

      {availabilities.length === 0 && !showAddForm && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 mb-4">No availability set yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Availability Slot
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Add Availability Slot</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <select
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <select
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleAddSlot}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {availabilities.length > 0 && (
        <div className="space-y-3">
          {availabilities.map((slot, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">{getDayName(slot.dayOfWeek)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                {slot.isRecurring && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Weekly
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteSlot(index)}
                className="text-red-600 hover:text-red-800 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!showAddForm && availabilities.length > 0 && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Slot</span>
        </button>
      )}
    </div>
  );
};
