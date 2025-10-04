import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentIds: string[]) => Promise<void>;
  availableStudents: { id: string; firstName: string; lastName: string; email: string }[];
  isLoading: boolean;
}

export const LinkStudentModal: React.FC<LinkStudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableStudents,
  isLoading
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) return;

    try {
      await onSubmit(selectedStudents);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error linking students:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Link Students to Payment Method
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {availableStudents.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No students available to link. All your students may already be linked to this payment method.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Select the students you want to link to this payment method:
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStudentToggle(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || selectedStudents.length === 0}
                  >
                    {isLoading ? 'Linking...' : `Link ${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};