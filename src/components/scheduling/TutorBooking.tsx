import React, { useState, useEffect, useCallback } from 'react';
import {
  sessionService,
  Tutor as ApiTutor,
  TutorAvailability,
  SearchTutorsResponse,
} from '../../services/sessionService';

interface Tutor extends ApiTutor {
  name: string;
  avatar: string;
  experience: string;
  specialties: string[];
  availability: {
    day: string;
    timeSlots: string[];
  }[];
  price: number;
  description: string;
  isOnline: boolean;
  languages: string[];
}

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
interface TutorBookingProps {
  onBookSession: (sessionData: Partial<Session>) => void;
  existingSessions: Session[];
}

// Avatar component for tutor display
const TutorAvatarDisplay: React.FC<{ tutor: Tutor }> = ({ tutor }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex justify-center mb-2">
      {tutor.avatar && !imageError ? (
        <img
          src={tutor.avatar}
          alt={tutor.name}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
          {getInitials(tutor.name)}
        </div>
      )}
    </div>
  );
};

export const TutorBooking: React.FC<TutorBookingProps> = ({ onBookSession, existingSessions }) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{ startTime: string; endTime: string; isAvailable: boolean }>
  >([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 7,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce search query
  useEffect(() => {
    console.log('⌨️ [TutorBooking] Search query changed:', searchQuery);
    const timer = setTimeout(() => {
      console.log('⏱️ [TutorBooking] Debounced search query set:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load tutors when subject, search query, or page changes
  useEffect(() => {
    loadTutors();
  }, [selectedSubject, debouncedSearchQuery, pagination.page]);

  // Keep mock data as fallback
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
        { day: 'Friday', timeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
      ],
      price: 25,
      description:
        "Hi there! I'm Teacher Emma and I love making math and science super fun! I use games, puzzles, and cool experiments to help kids discover how amazing learning can be!",
      isOnline: true,
      totalSessions: 450,
      languages: ['English', 'Spanish'],
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
        { day: 'Saturday', timeSlots: ['09:00', '10:00', '11:00', '12:00'] },
      ],
      price: 30,
      description:
        "Hey future scientists! I'm Teacher Mike and I turn learning into awesome adventures. We'll explore the world, do amazing experiments, and discover cool facts about everything around us!",
      isOnline: true,
      totalSessions: 320,
      languages: ['English'],
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
        { day: 'Friday', timeSlots: ['09:00', '10:00', '14:00', '15:00'] },
      ],
      price: 28,
      description:
        "Hello creative minds! I'm Teacher Luna and I believe every child is an artist and storyteller. Let's create beautiful art, write amazing stories, and explore the world through creativity!",
      isOnline: true,
      totalSessions: 290,
      languages: ['English', 'French'],
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
        { day: 'Saturday', timeSlots: ['10:00', '11:00', '14:00', '15:00'] },
      ],
      price: 26,
      description:
        "Hi explorers! I'm Teacher Alex and I love taking kids on reading adventures and historical journeys. We'll discover amazing places, meet interesting people, and learn fascinating facts!",
      isOnline: true,
      totalSessions: 380,
      languages: ['English'],
    },
  ];

  const loadTutors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {
        page: pagination.page,
        limit: 7,
      };

      // Add subject filter only if not 'all'
      if (selectedSubject !== 'all') {
        filters.subject = selectedSubject;
      }

      // Add search query if provided
      if (debouncedSearchQuery.trim()) {
        filters.query = debouncedSearchQuery.trim();
      }

      console.log('🔍 [TutorBooking] Loading tutors with filters:', filters);
      console.log('🔍 [TutorBooking] Search query:', debouncedSearchQuery);
      console.log('🔍 [TutorBooking] Selected subject:', selectedSubject);
      console.log('🔍 [TutorBooking] Current page:', pagination.page);

      const response: SearchTutorsResponse = await sessionService.searchTutors(filters);

      console.log('✅ [TutorBooking] API response received:', {
        tutorsCount: response.tutors?.length || 0,
        pagination: response.pagination,
        hasTutors: !!response.tutors,
        tutors:
          response.tutors?.map((t) => ({
            id: t.id,
            name: t.name || `${t.firstName} ${t.lastName}`,
            subjects: t.subjects,
          })) || [],
      });

      // Check if response is valid
      if (!response || !response.tutors) {
        console.error('❌ [TutorBooking] Invalid response structure:', response);
        setError('Invalid response from server');
        setTutors([]);
        return;
      }

      // Check if tutors array is empty
      if (response.tutors.length === 0) {
        console.warn('⚠️ [TutorBooking] No tutors returned from API');
        setTutors([]);
        setPagination(
          response.pagination || {
            page: 1,
            limit: 7,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
        return;
      }

      // Helper function to normalize subject names (e.g., "Mathematics" -> "math") for filtering
      const normalizeSubject = (subject: string): string => {
        const normalized = subject.toLowerCase().trim();
        // Map common variations to frontend subject IDs
        const subjectMap: Record<string, string> = {
          mathematics: 'math',
          math: 'math',
          reading: 'reading',
          science: 'science',
          physics: 'science',
          chemistry: 'science',
          biology: 'science',
          history: 'history',
          art: 'art',
          general: 'general',
          english: 'reading',
          language: 'reading',
        };
        return subjectMap[normalized] || normalized;
      };

      // Map API tutors to local Tutor interface with mock data for missing fields
      const formattedTutors: Tutor[] = response.tutors.map((tutor) => {
        // Get original subject names from backend (e.g., "Mathematics", "Physics")
        const originalSubjects = tutor.subjects || [];

        // Normalize subjects to match frontend subject IDs for filtering
        const normalizedSubjects = originalSubjects.map(normalizeSubject);

        return {
          ...tutor,
          name: tutor.name || `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || 'Tutor',
          avatar: tutor.avatar || tutor.profileImage || '👨‍🏫',
          subjects: normalizedSubjects, // Normalized IDs for filtering (e.g., "math", "science")
          experience: '5 years', // Mock - could calculate from totalSessions or get from API
          specialties: originalSubjects.slice(0, 3), // Original names from backend for display (e.g., "Mathematics", "Physics")
          availability: [], // Will be loaded separately when needed
          price: tutor.hourlyRate || 25,
          description: tutor.bio || 'Experienced tutor ready to help!',
          isOnline: true, // Mock - should come from API
          languages: ['English'], // Mock - should come from API
        };
      });

      console.log('📋 [TutorBooking] Formatted tutors:', formattedTutors.length);
      console.log(
        '📋 [TutorBooking] Formatted tutor details:',
        formattedTutors.map((t) => ({
          id: t.id,
          name: t.name,
          subjects: t.subjects,
          specialties: t.specialties,
          price: t.price,
        }))
      );

      setTutors(formattedTutors);
      setPagination(
        response.pagination || {
          page: 1,
          limit: 7,
          total: formattedTutors.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutors');
      console.error('❌ [TutorBooking] Failed to load tutors:', err);
      console.error('❌ [TutorBooking] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      // Use mock tutors as fallback if API fails
      setTutors(mockTutors.slice(0, 7));
      setPagination({
        page: 1,
        limit: 7,
        total: mockTutors.length,
        totalPages: Math.ceil(mockTutors.length / 7),
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subjects = [
    { id: 'all', label: 'All Subjects 📚', color: 'gray' },
    { id: 'math', label: 'Fun with Numbers 🔢', color: 'purple' },
    { id: 'reading', label: 'Reading Adventures 📖', color: 'blue' },
    { id: 'science', label: 'Science Explorers 🔬', color: 'green' },
    { id: 'history', label: 'World Discoveries 🌍', color: 'orange' },
    { id: 'art', label: 'Creative Arts 🎨', color: 'pink' },
    { id: 'general', label: 'General Learning 📚', color: 'gray' },
  ];

  // No need for client-side filtering - backend handles it
  const displayedTutors = tutors;

  // Fetch availability from API when tutor and date are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedTutor || !selectedDate) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        setLoadingAvailability(true);
        const availability = await sessionService.getTutorAvailability(
          selectedTutor.id,
          selectedDate,
          60 // 60 minutes duration
        );

        // Convert ISO datetime strings to HH:mm format for display
        const formattedSlots = availability.availableSlots
          .filter((slot) => slot.isAvailable)
          .map((slot) => {
            const date = new Date(slot.startTime);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return {
              time: `${hours}:${minutes}`,
              startTime: slot.startTime,
              endTime: slot.endTime,
            };
          });

        setAvailableTimeSlots(formattedSlots);
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        setAvailableTimeSlots([]);
        setError('Failed to load available time slots');
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedTutor, selectedDate]);

  const handleBookSession = async () => {
    if (!selectedTutor || !selectedDate || !selectedTimeSlot || !sessionTitle) {
      return;
    }

    // Find the full slot object to get the ISO startTime
    const selectedSlot = availableTimeSlots.find((slot) => slot.time === selectedTimeSlot);
    if (!selectedSlot) {
      setError('Please select a valid time slot');
      return;
    }

    const startDateTime = new Date(selectedSlot.startTime);

    try {
      setIsLoading(true);
      setError(null);

      // Map frontend subject IDs to backend subject names
      const subjectMapping: Record<string, string> = {
        'math': 'Mathematics',
        'reading': 'English',
        'science': 'Science',
        'history': 'History',
        'art': 'Art',
        'music': 'Music',
        'general': 'Mathematics',
      };

      // Valid backend subject names
      const validSubjects = [
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
        'Biology', 'History', 'Geography', 'Computer Science',
        'Art', 'Music', 'Spanish', 'French', 'German'
      ];

      // Determine the subject to use
      let subjectToUse: string;
      if (selectedSubject === 'all') {
        // Use tutor's first specialty (original backend subject names)
        // If specialties exist, use them; otherwise try to map from normalized subjects
        if (selectedTutor.specialties && selectedTutor.specialties.length > 0) {
          subjectToUse = selectedTutor.specialties[0];
        } else if (selectedTutor.subjects && selectedTutor.subjects.length > 0) {
          // Map normalized subject back to backend name
          const subjectKey = selectedTutor.subjects[0].toLowerCase();
          subjectToUse = subjectMapping[subjectKey] || 'Mathematics';
        } else {
          subjectToUse = 'Mathematics';
        }
      } else if (validSubjects.includes(selectedSubject)) {
        // Already a valid backend subject
        subjectToUse = selectedSubject;
      } else {
        // Map from frontend ID to backend name
        const subjectKey = selectedSubject.toLowerCase();
        subjectToUse = subjectMapping[subjectKey] || 'Mathematics';
      }

      // Use the book tutor API
      const session = await sessionService.bookTutorSession({
        tutorId: selectedTutor.id,
        title: sessionTitle, // Required field
        subject: subjectToUse,
        startTime: startDateTime.toISOString(),
        duration: 60, // 1-hour sessions
        description: sessionTitle, // Optional: can use same as title or be more detailed
        reminderEnabled: true,
        reminderTime: 15,
      });

      // Call the parent component's callback with the created session
      const sessionData = {
        ...session,
        title: sessionTitle,
        tutor: {
          id: selectedTutor.id,
          name: selectedTutor.name,
          avatar: selectedTutor.avatar,
        },
      };

      onBookSession(sessionData);

      // Reset form
      setSelectedTutor(null);
      setSelectedDate('');
      setSelectedTimeSlot('');
      setSessionTitle('');
      setShowBookingForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book session');
      console.error('Failed to book session:', err);
    } finally {
      setIsLoading(false);
    }
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Reset to page 1 when search changes
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by name, specialty, or subject (e.g., 'math', 'Emma', 'science')..."
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              What subject do you want to explore? 📚
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    // Reset to page 1 when subject changes
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-900 font-medium">Finding awesome teachers for you...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadTutors}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tutors Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Tutor Header */}
                <div className="bg-gradient-to-r from-yellow-100 to-pink-100 p-4 text-center">
                  <TutorAvatarDisplay tutor={tutor} />
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
                    <h4 className="text-sm font-semibold text-purple-900 mb-2">
                      Subjects I teach:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {tutor.specialties && tutor.specialties.length > 0 ? (
                        tutor.specialties.map((subject, index) => (
                          <span
                            key={`${subject}-${index}`}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                          >
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs italic">
                          No subject specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-purple-900 mb-2">
                      What makes me special:
                    </h4>
                    <div className="space-y-1">
                      {tutor.specialties.slice(0, 3).map((specialty) => (
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
                        : tutor.description}
                    </p>
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
            {displayedTutors.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Oops! No teachers found</h3>
                <p className="text-amber-700">
                  Try searching for different subjects or removing some filters!
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && !error && displayedTutors.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  pagination.hasPrevPage
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                ← Previous
              </button>

              <div className="text-purple-900 font-medium">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} tutors)
              </div>

              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  pagination.hasNextPage
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {showBookingForm && selectedTutor && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center p-4 z-50">
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                  {loadingAvailability ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading available times...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((slot, index) => (
                          <button
                            key={`${slot.startTime}-${index}`}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`p-2 text-sm rounded-lg border transition-all ${
                              selectedTimeSlot === slot.time
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </button>
                        ))}
                      </div>
                      {availableTimeSlots.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2">
                          No available time slots for this date. The tutor may not have set
                          availability for this day. Try a different day! 🗓️
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

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
