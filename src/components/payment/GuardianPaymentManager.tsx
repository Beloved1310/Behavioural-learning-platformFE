import React, { useState, useEffect } from 'react';
import { Plus, Users, DollarSign } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import { GuardianPaymentMethodCard } from './GuardianPaymentMethodCard';
import { AddGuardianPaymentMethodForm } from './AddGuardianPaymentMethodForm';
import { LinkStudentModal } from './LinkStudentModal';
import { EditSpendingLimitsModal } from './EditSpendingLimitsModal';
import { Button } from '../ui/Button';

export const GuardianPaymentManager: React.FC = () => {
  const { user } = useAuthStore();
  const {
    guardianPaymentMethods,
    isLoading,
    error,
    fetchGuardianPaymentMethods,
    addGuardianPaymentMethod,
    linkStudentToGuardianPayment,
    unlinkStudentFromGuardianPayment,
    updateSpendingLimits,
    deletePaymentMethod
  } = usePaymentStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showLinkStudentModal, setShowLinkStudentModal] = useState(false);
  const [showEditLimitsModal, setShowEditLimitsModal] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentNames, setStudentNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user?.role === 'PARENT') {
      fetchGuardianPaymentMethods();
      // TODO: Fetch linked students
      fetchLinkedStudents();
    }
  }, [user]);

  const fetchLinkedStudents = async () => {
    // TODO: Implement API call to fetch students linked to this parent/guardian
    // For now, using mock data
    const mockStudents = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com' },
      { id: '2', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' }
    ];
    setStudents(mockStudents);
    setStudentNames({
      '1': 'Alice Johnson',
      '2': 'Bob Johnson'
    });
  };

  const handleAddPaymentMethod = async (data: any) => {
    try {
      await addGuardianPaymentMethod(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding guardian payment method:', error);
    }
  };

  const handleLinkStudent = (methodId: string) => {
    setSelectedMethodId(methodId);
    setShowLinkStudentModal(true);
  };

  const handleUnlinkStudent = async (methodId: string, studentId: string) => {
    if (confirm('Are you sure you want to unlink this student from this payment method?')) {
      try {
        await unlinkStudentFromGuardianPayment(methodId, studentId);
      } catch (error) {
        console.error('Error unlinking student:', error);
      }
    }
  };

  const handleEditLimits = (methodId: string) => {
    setSelectedMethodId(methodId);
    setShowEditLimitsModal(true);
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (confirm('Are you sure you want to delete this payment method? This action cannot be undone.')) {
      try {
        await deletePaymentMethod(methodId);
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const handleLinkStudentSubmit = async (studentIds: string[]) => {
    if (!selectedMethodId) return;

    try {
      for (const studentId of studentIds) {
        await linkStudentToGuardianPayment(selectedMethodId, studentId);
      }
      setShowLinkStudentModal(false);
      setSelectedMethodId(null);
    } catch (error) {
      console.error('Error linking students:', error);
    }
  };

  const handleEditLimitsSubmit = async (data: { spendingLimit?: number; monthlySpendingLimit?: number }) => {
    if (!selectedMethodId) return;

    try {
      await updateSpendingLimits(selectedMethodId, data);
      setShowEditLimitsModal(false);
      setSelectedMethodId(null);
    } catch (error) {
      console.error('Error updating spending limits:', error);
    }
  };

  if (user?.role !== 'PARENT') {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent/Guardian Access Only</h3>
        <p className="text-gray-600">This section is only available for parent/guardian accounts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guardian Payment Methods</h2>
          <p className="text-gray-600 mt-1">
            Manage payment methods and spending limits for your students
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <AddGuardianPaymentMethodForm
            onSubmit={handleAddPaymentMethod}
            onCancel={() => setShowAddForm(false)}
            isLoading={isLoading}
            availableStudents={students}
          />
        </div>
      )}

      {guardianPaymentMethods.length === 0 && !showAddForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
          <p className="text-gray-600 mb-4">
            Add a payment method to enable secure payments for your students' tutoring sessions.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Payment Method
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {guardianPaymentMethods.map((method) => (
            <GuardianPaymentMethodCard
              key={method.id}
              paymentMethod={method}
              studentNames={studentNames}
              onEditLimits={handleEditLimits}
              onLinkStudent={handleLinkStudent}
              onUnlinkStudent={handleUnlinkStudent}
              onDelete={handleDeletePaymentMethod}
            />
          ))}
        </div>
      )}

      {/* Link Student Modal */}
      {showLinkStudentModal && selectedMethodId && (
        <LinkStudentModal
          isOpen={showLinkStudentModal}
          onClose={() => {
            setShowLinkStudentModal(false);
            setSelectedMethodId(null);
          }}
          onSubmit={handleLinkStudentSubmit}
          availableStudents={students.filter(student => {
            const currentMethod = guardianPaymentMethods.find(m => m.id === selectedMethodId);
            return !currentMethod?.studentIds.includes(student.id);
          })}
          isLoading={isLoading}
        />
      )}

      {/* Edit Spending Limits Modal */}
      {showEditLimitsModal && selectedMethodId && (
        <EditSpendingLimitsModal
          isOpen={showEditLimitsModal}
          onClose={() => {
            setShowEditLimitsModal(false);
            setSelectedMethodId(null);
          }}
          onSubmit={handleEditLimitsSubmit}
          currentLimits={guardianPaymentMethods.find(m => m.id === selectedMethodId)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};