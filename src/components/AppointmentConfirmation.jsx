import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AppointmentConfirmation = ({ isOpen, onClose, appointmentData }) => {
  const navigate = useNavigate();

  // Send browser notification when modal opens
  useEffect(() => {
    if (isOpen && appointmentData && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🎉 Appointment Confirmed!', {
        body: `Token T-${appointmentData.token_number} at ${appointmentData.hospital_name}. ${appointmentData.people_ahead} people ahead.`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'appointment-confirmed',
        requireInteraction: true,
      });

      setTimeout(() => notification.close(), 8000);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [isOpen, appointmentData]);

  if (!isOpen || !appointmentData) return null;

  const handleViewQueueStatus = () => {
    navigate("/queue-status", {
      state: {
        appointment_id: appointmentData.appointment_id
      }
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
    // Navigate to home or keep on current page
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed</h2>
          <p className="text-gray-600">Your appointment has been successfully booked!</p>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium text-gray-900">{appointmentData.patient_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Hospital:</span>
              <span className="font-medium text-gray-900">{appointmentData.hospital_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium text-gray-900">{appointmentData.service_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-bold text-blue-600 text-lg">T-{appointmentData.token_number}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(appointmentData.appointment_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Queue Information</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">People Ahead:</span>
              <span className="font-bold text-blue-600 text-lg">{appointmentData.people_ahead}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Wait:</span>
              <span className="font-bold text-orange-600">
                {appointmentData.estimated_wait_minutes} minutes
              </span>
            </div>
          </div>
          
          {appointmentData.people_ahead === 0 && (
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-green-800 text-sm font-medium text-center">
                🎉 You're next in queue!
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleViewQueueStatus}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View Queue Status
          </button>
          
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Please arrive at the hospital 5-10 minutes before your estimated time. 
            The wait time may change based on the queue progress.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentConfirmation;
