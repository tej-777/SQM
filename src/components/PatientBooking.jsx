import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import AppointmentConfirmation from './AppointmentConfirmation';

const PatientBooking = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [hospitalAvailabilityList, setHospitalAvailabilityList] = useState([]);
  const [loadingHospitalAvailability, setLoadingHospitalAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Fetch services when hospital is selected
  useEffect(() => {
    if (selectedHospital) {
      fetchServices();
    }
  }, [selectedHospital]);

  // Fetch available dates when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchAvailableDates();
    }
  }, [selectedService]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/hospitals`);
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
        console.log('Hospitals loaded:', data); // Debug log
      } else {
        console.error('Failed to fetch hospitals:', response.status);
        setError('Failed to fetch hospitals');
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to fetch hospitals');
    }
  };

  const fetchServices = async () => {
    try {
      console.log('DEBUG: Fetching services for hospital:', selectedHospital);
      const response = await fetch(`${API_BASE_URL}/hospital-services/${selectedHospital}`);
      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG: Hospital services response:', data);
        console.log('DEBUG: Service structure:', data[0]);
        setServices(data);
      } else {
        console.error('Failed to fetch services:', response.status);
        setError('Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to fetch services');
    }
  };

  const fetchAvailableDates = async () => {
    try {
      console.log('DEBUG: Fetching availability for service:', selectedService);
      const response = await fetch(`${API_BASE_URL}/appointments/availability/${selectedService}`);
      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG: Availability response:', data);
        
        if (data.length === 0) {
          setError('No appointment slots available for this service. Please contact the hospital to set up availability.');
          setAvailableDates([]);
        } else {
          // Filter to only show dates with available slots
          const availableDates = data.filter(dateInfo => dateInfo.available_slots > 0);
          console.log('DEBUG: Filtered available dates:', availableDates);
          
          if (availableDates.length === 0) {
            setError('All appointment slots are currently booked. Please check back later or contact the hospital.');
            setAvailableDates([]);
          } else {
            setAvailableDates(availableDates);
            setError(''); // Clear any previous errors
          }
        }
      } else {
        console.error('Failed to fetch availability:', response.status);
        setError('Failed to check appointment availability. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to check appointment availability. Please try again.');
    }
  };

  const handleBooking = async () => {
    console.log('DEBUG: Booking button clicked manually');
    
    if (!selectedDate || !patientName || !patientPhone) {
      setError('Please fill all fields');
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      console.log('DEBUG: Already loading, preventing duplicate submission');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Debug logging to identify the issue
      console.log('DEBUG: Booking attempt with:');
      console.log('- selectedService object:', selectedService);
      console.log('- selectedDate:', selectedDate);
      console.log('- patientName:', patientName);
      console.log('- patientPhone:', patientPhone);
      console.log('- selectedService type:', typeof selectedService);

      // Get the correct hospital_service_id
      const hospitalServiceId = selectedService?.hospital_service_id || 
                               selectedService?.id || 
                               selectedService?.service_id;
      
      console.log('DEBUG: Using hospital_service_id for availability check:', hospitalServiceId);

      // First check if availability exists for this service and date
      console.log('DEBUG: Checking availability...');
      const availabilityResponse = await fetch(`${API_BASE_URL}/appointments/availability/${hospitalServiceId}`);
      
      if (!availabilityResponse.ok) {
        setError('Failed to check availability');
        return;
      }
      
      const availabilities = await availabilityResponse.json();
      console.log('DEBUG: Available dates:', availabilities);
      
      // Check if the selected date has availability
      const selectedDateAvailability = availabilities.find(avail => avail.date === selectedDate);
      
      if (!selectedDateAvailability) {
        setError('No appointment slots available for this date. Please contact the hospital directly or try a different date.');
        return;
      }
      
      if (selectedDateAvailability.available_slots <= 0) {
        setError('All slots are booked for this date. Please select a different date or contact the hospital.');
        return;
      }

      console.log('DEBUG: Availability confirmed, proceeding with booking...');
      console.log('DEBUG: Available slots:', selectedDateAvailability.available_slots);
      
      // Debug the booking payload
      console.log('DEBUG: Selected service object:', selectedService);
      console.log('DEBUG: Service structure:', Object.keys(selectedService || {}));
      
      console.log('DEBUG: Using hospital_service_id for booking:', hospitalServiceId);
      console.log('DEBUG: hospitalServiceId type:', typeof hospitalServiceId);
      console.log('DEBUG: hospitalServiceId value:', JSON.stringify(hospitalServiceId));
      
      const bookingPayload = {
        hospital_service_id: hospitalServiceId,
        appointment_date: selectedDate,
        patient_name: patientName,
        patient_phone: patientPhone
      };
      console.log("BOOKING PAYLOAD:", bookingPayload);

      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();
      console.log('DEBUG: Booking API response:', data);

      if (!response.ok) {
        setError(data.detail || 'Booking failed');
        return;
      }

      // Dispatch queue update event to refresh staff dashboard
      console.log('DEBUG: Dispatching queueUpdated event');
      window.dispatchEvent(new Event("queueUpdated"));

      // Show confirmation modal with appointment data
      setConfirmedAppointment(data);
      setShowConfirmation(true);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Remove form submission and use button click handler */}
          <div className="space-y-4 sm:space-y-6">
            {/* Hospital Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Hospital
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a hospital...</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service
              </label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value);
                  setSelectedService(service);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={!selectedHospital}
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name || 'Unknown Service'}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Dates */}
            {availableDates.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Available Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableDates.map((dateInfo) => (
                    <button
                      key={dateInfo.date}
                      onClick={() => setSelectedDate(dateInfo.date)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDate === dateInfo.date
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dateInfo.date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBooking}
              disabled={loading || !selectedDate}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Confirmation Modal */}
      <AppointmentConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        appointmentData={confirmedAppointment}
      />
    </div>
  );
};

export default PatientBooking;
