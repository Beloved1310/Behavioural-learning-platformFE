import React, { useState } from 'react';
import { ChatReport } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/Button';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  messageId?: string;
  reportedUserName?: string;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  conversationId,
  messageId,
  reportedUserName
}) => {
  const [reason, setReason] = useState<ChatReport['reason']>('inappropriate_content');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reportConversation } = useChatStore();

  const reportReasons = [
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Content that violates community guidelines' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or personal attacks' },
    { value: 'spam', label: 'Spam', description: 'Repetitive, unwanted, or promotional messages' },
    { value: 'safety_concern', label: 'Safety Concern', description: 'Content that may pose a risk to safety' },
    { value: 'other', label: 'Other', description: 'Please provide details in the description below' }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() && reason === 'other') {
      alert('Please provide a description for "Other" reports');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await reportConversation(conversationId, reason, description.trim(), messageId);
      
      // Reset form
      setReason('inappropriate_content');
      setDescription('');
      
      // Show success message
      alert('Report submitted successfully. Our team will review it shortly.');
      onClose();
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('inappropriate_content');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Report {messageId ? 'Message' : 'Conversation'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {reportedUserName && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Reporting content from:</strong> {reportedUserName}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's wrong with this {messageId ? 'message' : 'conversation'}?
              </label>
              <div className="space-y-2">
                {reportReasons.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={option.value}
                      checked={reason === option.value}
                      onChange={(e) => setReason(e.target.value as ChatReport['reason'])}
                      className="mt-1 text-blue-600"
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details {reason === 'other' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide any additional context that would help us understand the issue..."
                className="input resize-none"
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Privacy Notice:</strong> Your report will be reviewed by our safety team. 
                We may contact you for additional information if needed.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};