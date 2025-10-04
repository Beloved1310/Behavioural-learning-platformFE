import React, { useState, useEffect } from 'react';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  experience: string;
  specialties: string[];
  availability: {
    day: string;
    timeSlots: string[];
  }[];
  price: number;
  description: string;
  isOnline: boolean;
  totalSessions: number;
  languages: string[];
}

interface Session {
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
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
}

interface TutorBookingProps {
  onBookSession: (sessionData: Partial<Session>) => void;
  existingSessions: Session[];
}

export const TutorBooking: React.FC<TutorBookingProps> = ({
  onBookSession,
  existingSessions
}) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    // Mock tutor data - replace with API calls
    const mockTutors: Tutor[] = [
      {
        id: 'tutor-1',
        name: 'Teacher Emma',
        avatar: '👩‍🏫',
        subjects: ['math', 'science'],
        rating: 4.9,
        experience: '5 years',
        specialties: ['Fun Math Games', 'Problem Solving', 'Basic Algebra'],
        availability: [
          { day: 'Monday', timeSlots: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
          { day: 'Wednesday', timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
          { day: 'Friday', timeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'] }
        ],
        price: 25,
        description: 'Hi there! I\'m Teacher Emma and I love making math and science super fun! I use games, puzzles, and cool experiments to help kids discover how amazing learning can be!',
        isOnline: true,
        totalSessions: 450,
        languages: ['English', 'Spanish']
      },
      {
        id: 'tutor-2',
        name: 'Teacher Mike',
        avatar: '👨‍🔬',
        subjects: ['science', 'reading'],
        rating: 4.8,
        experience: '7 years',
        specialties: ['Cool Science Experiments', 'Nature Discovery', 'Space Adventures'],
        availability: [
          { day: 'Tuesday', timeSlots: ['10:00', '11:00', '15:00', '16:00'] },
          { day: 'Thursday', timeSlots: ['09:00', '10:00', '11:00', '15:00'] },
          { day: 'Saturday', timeSlots: ['09:00', '10:00', '11:00', '12:00'] }
        ],
        price: 30,
        description: 'Hey future scientists! I\'m Teacher Mike and I turn learning into awesome adventures. We\'ll explore the world, do amazing experiments, and discover cool facts about everything around us!',
        isOnline: true,
        totalSessions: 320,
        languages: ['English']
      },
      {
        id: 'tutor-3',
        name: 'Teacher Luna',
        avatar: '👩‍🎨',
        subjects: ['art', 'reading', 'history'],
        rating: 5.0,
        experience: '4 years',
        specialties: ['Creative Writing', 'Drawing & Painting', 'Story Adventures'],
        availability: [
          { day: 'Monday', timeSlots: ['11:00', '14:00', '15:00', '16:00'] },
          { day: 'Wednesday', timeSlots: ['10:00', '11:00', '15:00', '16:00'] },
          { day: 'Friday', timeSlots: ['09:00', '10:00', '14:00', '15:00'] }
        ],
        price: 28,
        description: 'Hello creative minds! I\'m Teacher Luna and I believe every child is an artist and storyteller. Let\'s create beautiful art, write amazing stories, and explore the world through creativity!',
        isOnline: true,
        totalSessions: 290,
        languages: ['English', 'French']
      },
      {
        id: 'tutor-4',
        name: 'Teacher Alex',
        avatar: '🧑‍🏫',
        subjects: ['reading', 'history', 'general'],
        rating: 4.7,
        experience: '6 years',
        specialties: ['Reading Adventures', 'World Discoveries', 'Fun Facts'],
        availability: [
          { day: 'Tuesday', timeSlots: ['09:00', '14:00', '15:00', '16:00'] },
          { day: 'Thursday', timeSlots: ['10:00', '11:00', '14:00', '15:00'] },
          { day: 'Saturday', timeSlots: ['10:00', '11:00', '14:00', '15:00'] }
        ],
        price: 26,
        description: 'Hi explorers! I\'m Teacher Alex and I love taking kids on reading adventures and historical journeys. We\'ll discover amazing places, meet interesting people, and learn fascinating facts!',
        isOnline: true,
        totalSessions: 380,
        languages: ['English']
      }
    ];

    setTutors(mockTutors);
  }, []);

  const subjects = [
    { id: 'all', label: 'All Subjects 📚', color: 'gray' },
    { id: 'math', label: 'Fun with Numbers 🔢', color: 'purple' },
    { id: 'reading', label: 'Reading Adventures 📖', color: 'blue' },
    { id: 'science', label: 'Science Explorers 🔬', color: 'green' },
    { id: 'history', label: 'World Discoveries 🌍', color: 'orange' },
    { id: 'art', label: 'Creative Arts 🎨', color: 'pink' },
    { id: 'general', label: 'General Learning 📚', color: 'gray' }
  ];

  const filteredTutors = tutors.filter(tutor => {
    const matchesSubject = selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);
    const matchesSearch = searchQuery === '' ||
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesSearch;
  });

  const getAvailableTimeSlots = (tutor: Tutor, date: string) => {
    if (!date) return [];

    const selectedDateObj = new Date(date);
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const availability = tutor.availability.find(av => av.day === dayName);
    if (!availability) return [];

    // Filter out time slots that are already booked
    const bookedSlots = existingSessions
      .filter(session =>
        session.tutor?.id === tutor.id &&
        new Date(session.startTime).toDateString() === selectedDateObj.toDateString()
      )
      .map(session => new Date(session.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));

    return availability.timeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const handleBookSession = () => {
    if (!selectedTutor || !selectedDate || !selectedTimeSlot || !sessionTitle) {
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTimeSlot}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 60); // 1-hour sessions

    const sessionData = {
      title: sessionTitle,
      subject: selectedSubject === 'all' ? selectedTutor.subjects[0] : selectedSubject,
      type: 'tutoring' as const,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      tutor: {
        id: selectedTutor.id,
        name: selectedTutor.name,
        avatar: selectedTutor.avatar
      }
    };

    onBookSession(sessionData);

    // Reset form
    setSelectedTutor(null);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setSessionTitle('');
    setShowBookingForm(false);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              Search for your perfect teacher! 🔍
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or specialty (e.g., 'math games', 'experiments')..."
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              What subject do you want to explore? 📚
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedSubject === subject.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  {subject.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map(tutor => (
          <div
            key={tutor.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            {/* Tutor Header */}
            <div className="bg-gradient-to-r from-yellow-100 to-pink-100 p-4 text-center">
              <div className="text-4xl mb-2">{tutor.avatar}</div>
              <h3 className="text-lg font-bold text-purple-900">{tutor.name}</h3>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 font-medium">{tutor.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-amber-700">{tutor.experience}</span>
                <span className="text-gray-400">•</span>
                <span className="text-green-600">{tutor.totalSessions} sessions</span>
              </div>
              {tutor.isOnline && (
                <div className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online Now!
                </div>
              )}
            </div>

            {/* Tutor Info */}
            <div className="p-4">
              {/* Subjects */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">Subjects I teach:</h4>
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.map(subject => (
                    <span
                      key={subject}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {subjects.find(s => s.id === subject)?.label || subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">What makes me special:</h4>
                <div className="space-y-1">
                  {tutor.specialties.slice(0, 3).map(specialty => (
                    <div key={specialty} className="flex items-center text-xs text-amber-700">
                      <span className="mr-1">✨</span>
                      {specialty}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {tutor.description.length > 100
                    ? `${tutor.description.substring(0, 100)}...`
                    : tutor.description
                  }
                </p>
              </div>

              {/* Languages & Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs">
                  <span className="text-purple-900 font-medium">Languages: </span>
                  <span className="text-amber-700">{tutor.languages.join(', ')}</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${tutor.price}/hour
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => {
                  setSelectedTutor(tutor);
                  setShowBookingForm(true);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                🚀 Book a Session!
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-purple-900 mb-2">
            Oops! No teachers found
          </h3>
          <p className="text-amber-700">
            Try searching for different subjects or removing some filters!
          </p>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingForm && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-900">
                Book with {selectedTutor.name} {selectedTutor.avatar}
              </h3>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Title */}
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  What do you want to learn? 🌟
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g., Help with fractions, Science experiment fun..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  When do you want to learn? 📅
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTomorrowDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    What time works for you? ⏰
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableTimeSlots(selectedTutor, selectedDate).map(timeSlot => (
                      <button
                        key={timeSlot}
                        onClick={() => setSelectedTimeSlot(timeSlot)}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          selectedTimeSlot === timeSlot
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {new Date(`2000-01-01T${timeSlot}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </button>
                    ))}
                  </div>
                  {getAvailableTimeSlots(selectedTutor, selectedDate).length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      No available time slots for this date. Try a different day! 🗓️
                    </p>
                  )}
                </div>
              )}

              {/* Price Info */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Session Price:</span>
                  <span className="text-lg font-bold text-green-600">${selectedTutor.price}</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  1-hour session • Payment after session
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleBookSession}
                  disabled={!sessionTitle || !selectedDate || !selectedTimeSlot}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  🎉 Book My Session!
                </button>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};