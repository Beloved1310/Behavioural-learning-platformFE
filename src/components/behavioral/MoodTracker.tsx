import React, { useState } from 'react';
import { useBehavioralTracking } from '../../hooks/useBehavioralTracking';
import { useAuthStore } from '../../store/authStore';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

const moods: Mood[] = [
  { id: 'excited', name: 'Super Excited!', emoji: '🤩', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'happy', name: 'Really Happy', emoji: '😊', color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'good', name: 'Feeling Good', emoji: '🙂', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'okay', name: 'Just Okay', emoji: '😐', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 'tired', name: 'A Bit Tired', emoji: '😴', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'sad', name: 'Feeling Sad', emoji: '😢', color: 'text-blue-800', bgColor: 'bg-blue-200' },
  { id: 'frustrated', name: 'Frustrated', emoji: '😤', color: 'text-red-600', bgColor: 'bg-red-100' },
];

interface MoodTrackerProps {
  onMoodLogged?: (mood: string, intensity: number) => void;
  className?: string;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodLogged, className = '' }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { user } = useAuthStore();
  const { trackMood } = useBehavioralTracking(user?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood || !user?.id) return;

    setIsSubmitting(true);

    try {
      await trackMood(selectedMood, intensity, notes);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setSelectedMood('');
      setIntensity(5);
      setNotes('');

      onMoodLogged?.(selectedMood, intensity);
    } catch (error) {
      console.error('Failed to log mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMoodData = moods.find(m => m.id === selectedMood);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-purple-900">How are you feeling today?</h3>
          <p className="text-amber-600 text-sm mt-1">Let us know so we can help you learn better! 🌟</p>
        </div>
        <div className="text-3xl">💭</div>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-semibold text-green-800">Thanks for sharing!</p>
              <p className="text-green-600 text-sm">Your mood helps us make learning more fun for you!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Mood Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-900 mb-3">
            Pick the emoji that shows how you feel:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedMood === mood.id
                    ? `border-purple-400 ${mood.bgColor} scale-105`
                    : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className={`text-xs font-medium ${selectedMood === mood.id ? mood.color : 'text-gray-600'}`}>
                    {mood.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        {selectedMood && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-900 mb-3">
              How strong is this feeling? (1 = a little, 10 = very strong)
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #e879f9 0%, #e879f9 ${(intensity - 1) * 11.11}%, #e5e7eb ${(intensity - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>A little</span>
                <span className="font-semibold text-purple-600">{intensity}/10</span>
                <span>Very strong</span>
              </div>
            </div>
          </div>
        )}

        {/* Optional Notes */}
        {selectedMood && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-900 mb-3">
              Want to tell us more? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made you feel this way? What would make you feel better?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {notes.length}/200 characters
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMood || isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            selectedMood && !isSubmitting
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving your mood...
            </div>
          ) : selectedMood ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">{selectedMoodData?.emoji}</span>
              Share My Mood
            </div>
          ) : (
            'Pick a mood first!'
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center text-sm text-blue-800">
          <span className="text-lg mr-2">💙</span>
          <p>Your mood helps us understand how you're doing and makes your learning experience better!</p>
        </div>
      </div>
    </div>
  );
};