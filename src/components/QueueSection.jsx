import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueSection = ({ hospitalServices, appointmentDate }) => {
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servingPatient, setServingPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(appointmentDate || new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState(''); // Add service selection state

  // Auto-select first service when services are loaded
  useEffect(() => {
    if (hospitalServices && hospitalServices.length > 0 && !selectedService) {
      setSelectedService(hospitalServices[0].id);
      console.log('DEBUG: Auto-selected first service:', hospitalServices[0]);
    }
  }, [hospitalServices]);

  const handleServeNext = async () => {
    try {
      console.log('DEBUG: hospitalServices:', hospitalServices);
      console.log('DEBUG: appointmentDate:', selectedDate);
      console.log('DEBUG: selectedService:', selectedService);
      
      if (!hospitalServices || hospitalServices.length === 0 || !selectedService) {
        console.error('No hospital services or selected service available');
        return;
      }
      
      const service = hospitalServices.find(s => s.id === selectedService);
      console.log('DEBUG: Using service for API call:', service);
      
      const response = await fetch('http://localhost:8000/queue/call-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hospital_service_id: selectedService,
          appointment_date: selectedDate
        })
      });
      
      console.log('DEBUG: Response status:', response.status);
      console.log('DEBUG: Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('DEBUG: Error response:', errorData);
        
        if (response.status === 401) {
          console.error('Authentication failed - token may be expired');
        }
        return;
      }
      
      const result = await response.json();
      console.log('DEBUG: Success response:', result);
      
      // Refresh queue data
      fetchQueue();
    } catch (err) {
      console.error('Error serving next patient:', err);
    }
  };

  const handleSkip = async () => {
    try {
      console.log('DEBUG: Skip - hospitalServices:', hospitalServices);
      console.log('DEBUG: Skip - appointmentDate:', selectedDate);
      console.log('DEBUG: Skip - selectedService:', selectedService);
      
      if (!hospitalServices || hospitalServices.length === 0 || !selectedService) {
        console.error('No hospital services or selected service available');
        return;
      }
      
      const service = hospitalServices.find(s => s.id === selectedService);
      console.log('DEBUG: Skip - Using service for API call:', service);
      
      const response = await fetch('http://localhost:8000/queue/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hospital_service_id: selectedService,
          appointment_date: selectedDate
        })
      });
      
      console.log('DEBUG: Skip - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('DEBUG: Skip - Error response:', errorData);
        
        if (response.status === 401) {
          console.error('Skip - Authentication failed - token may be expired');
        }
        return;
      }
      
      const result = await response.json();
      console.log('DEBUG: Skip - Success response:', result);
      
      // Refresh queue data
      fetchQueue();
    } catch (err) {
      console.error('Error skipping patient:', err);
    }
  };

  // Add estimated wait time calculations
  const calculateEstimatedWaitTime = (tokenNumber, index) => {
    // Average service time: 5 minutes per patient
    const averageServiceTime = 5;
    const estimatedWaitMinutes = (tokenNumber - 1) * averageServiceTime;
    const estimatedWaitHours = Math.floor(estimatedWaitMinutes / 60);
    const remainingMinutes = estimatedWaitMinutes % 60;
    
    if (estimatedWaitHours > 0) {
      return `${estimatedWaitHours}h ${remainingMinutes}m`;
    } else {
      return `${estimatedWaitMinutes}m`;
    }
  };

  console.log("DEBUG: QueueSection props:", { hospitalServices, appointmentDate });

  // Fetch queue status from backend
  const fetchQueue = async () => {
    try {
      setLoading(true);
      
      // Use selectedDate and selectedService
      const dateToFetch = selectedDate;
      const serviceToFetch = selectedService;
      console.log("DEBUG: Fetching queue for date:", dateToFetch);
      console.log("DEBUG: Fetching queue for service:", serviceToFetch);
      
      // Validate that we have hospital services and appointment date
      if (!hospitalServices || hospitalServices.length === 0 || !dateToFetch || !serviceToFetch) {
        console.log("DEBUG: Missing hospital services, date, or service, skipping fetch");
        setLoading(false);
        setQueueData([]);
        return;
      }
      
      console.log(`DEBUG: Fetching queue for service ${serviceToFetch} on ${dateToFetch}`);
      
      // Fetch queue for SELECTED hospital service and date
      const apiUrl = `http://localhost:8000/queue/status/${serviceToFetch}/${dateToFetch}`;
      console.log("DEBUG: Queue API request URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("DEBUG: API Response status:", response.status);

      if (!response.ok) {
        console.error(`DEBUG: Failed to fetch for service ${serviceToFetch}:`, response.status);
        setQueueData([]);
        return [];
      }
      
      const data = await response.json();
      console.log("DEBUG: Raw API data:", data);
      console.log("DEBUG: Data type:", typeof data);
      console.log("DEBUG: Data is array:", Array.isArray(data));
      console.log("DEBUG: Data length:", data?.length);
      console.log("DEBUG: Service requested:", serviceToFetch);
      console.log("DEBUG: Date requested:", dateToFetch);
      
      // Check if returned data actually matches the requested date
      let filteredAppointments = [];
      if (data && data.length > 0) {
        console.log("DEBUG: Checking if returned data matches requested date...");
        filteredAppointments = data.filter(a => a.appointment_date === dateToFetch);
        console.log("DEBUG: Data matching requested date:", filteredAppointments);
        console.log("DEBUG: Matching data length:", filteredAppointments.length);
        
        if (filteredAppointments.length === 0) {
          console.log("DEBUG: No data matches requested date, setting empty array");
          setQueueData([]);
        } else {
          console.log("DEBUG: Found data matching requested date, setting queueData");
          setQueueData(filteredAppointments);
        }
      } else {
        console.log("DEBUG: API returned no data or empty array");
        setQueueData([]);
      }
      
      // Final filtered appointments for all UI logic
      const finalFilteredAppointments = filteredAppointments.length > 0 ? filteredAppointments : [];
      console.log("DEBUG: Final filtered appointments for UI:", finalFilteredAppointments);
      
      // Add service information to each appointment (prioritize backend service_name, then fallback)
      const service = hospitalServices.find(s => s.id === serviceToFetch);
      const result = finalFilteredAppointments.map(appointment => ({
        ...appointment,
        // Use backend service_name first, then fallback to frontend service data
        service_name: appointment.service_name || service?.name || `Service ${serviceToFetch?.slice(0, 8)}...`,
        hospital_name: appointment.hospital_name || service?.hospital_name || 'Hospital'
      }));
      
      console.log("DEBUG: Final queue data:", result);
      setQueueData(result);
    } catch (err) {
      console.error("DEBUG: Queue fetch error:", err);
      setError("Failed to fetch queue");
    } finally {
      setLoading(false);
    }
  };

  // Load queue when component mounts or when date/service changes
  useEffect(() => {
    fetchQueue();
  }, [hospitalServices, selectedDate, selectedService]); // Add selectedService dependency

  // Auto-refresh queue every 45 seconds (only queue data, not entire page)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue();
    }, 45000);

    return () => clearInterval(interval);
  }, [hospitalServices, selectedDate, selectedService]); // Include selectedService in auto-refresh

  // Listen for queue update events (when new booking happens)
  useEffect(() => {
    const refresh = () => {
      console.log('DEBUG: Queue update event received, refreshing queue');
      fetchQueue();
    };

    window.addEventListener("queueUpdated", refresh);

    return () => {
      window.removeEventListener("queueUpdated", refresh);
    };
  }, [hospitalServices, selectedDate, selectedService]); // Include selectedService in auto-refresh

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">⚠️ {error}</div>
          <button 
            onClick={fetchQueue}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Enhanced Date Picker
  const EnhancedDatePicker = ({ selectedDate, onDateChange }) => {
    return (
      <div className="flex items-center gap-4">
        <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
          Select Date:
        </label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  return (
    <motion.div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Queue Status</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <label htmlFor="service-select" className="text-sm font-medium text-gray-700">
                Select Service:
              </label>
              <select
                id="service-select"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a service...</option>
                {hospitalServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name || `Service ${service.id?.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <EnhancedDatePicker
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(date)}
              />
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full sm:w-auto px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Today
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Showing appointments for: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
        </div>
      </div>

      {(() => {
        console.log('=== DEBUG: UI Rendering Check ===');
        console.log('queueData:', queueData);
        console.log('queueData length:', queueData?.length);
        console.log('Should show cards:', queueData && queueData.length > 0);
        console.log('Should show empty state:', !queueData || queueData.length === 0);
        console.log('====================================');
        return queueData && queueData.length > 0;
      })() ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Token */}
          <motion.div 
            className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
            animate={(() => {
              const calledPatient = queueData?.find(p => p.status === 'CALLED' && p.appointment_date === selectedDate);
              return calledPatient ? {
                scale: 1.02,
                backgroundColor: "#dbeafe"
              } : {};
            })()}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Now Serving</p>
                <motion.p className="text-3xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED' && p.appointment_date === selectedDate);
                    return calledPatient ? calledPatient.id : 'none';
                  })()}
                >
                  {(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED' && p.appointment_date === selectedDate);
                    return calledPatient ? `T-${calledPatient.token_number}` : 'T-0';
                  })()}
                </motion.p>
                <motion.p className="text-indigo-100 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED' && p.appointment_date === selectedDate);
                    return calledPatient ? calledPatient.patient_name : 'none';
                  })()}
                >
                  {(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED' && p.appointment_date === selectedDate);
                    return calledPatient ? calledPatient.patient_name : 'No patient';
                  })()}
                </motion.p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleServeNext}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Serve Next
                  </button>
                  <button
                    onClick={handleSkip}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Skip Patient
                  </button>
                </div>
                <div className="text-4xl">🏥</div>
              </div>
            </div>
          </motion.div>

          {/* Queue Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {queueData ? queueData.filter(a => a.status === 'WAITING' && a.appointment_date === selectedDate).length : 0}
              </p>
              <p className="text-sm text-gray-600">Waiting</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  const calledPatient = queueData?.find(a => a.status === 'CALLED' && a.appointment_date === selectedDate);
                  return calledPatient ? `T-${calledPatient.token_number}` : '-';
                })()}
              </p>
              <p className="text-sm text-gray-600">
                {queueData?.find(a => a.status === 'CALLED' && a.appointment_date === selectedDate) ? 'Now Serving' : 'Next In'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {queueData ? queueData.filter(a => a.status === 'SERVED' && a.appointment_date === selectedDate).length : 0}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>

          {/* Waiting Queue List */}
          {(() => {
            const waitingPatients = queueData && queueData.filter(a => 
              a.status === 'WAITING' && 
              a.appointment_date === selectedDate
            );
            console.log('DEBUG: Current queueData:', queueData);
            console.log('DEBUG: Selected date:', selectedDate);
            console.log('DEBUG: Waiting patients:', waitingPatients);
            console.log('DEBUG: Waiting patients count:', waitingPatients?.length || 0);
            
            return waitingPatients && waitingPatients.length > 0;
          })() && (
            <motion.div layout className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Waiting Queue</h3>
              <motion.div layout className="space-y-2">
                <AnimatePresence>
                  {queueData
                    .filter(a => a.status === 'WAITING' && a.appointment_date === selectedDate)
                    .slice(0, 5) // Show first 5 waiting patients
                    .map((appointment, index) => (
                      <motion.div 
                        key={appointment.id} 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                      >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">T-{appointment.token_number}</span>
                            <span className="text-gray-600">{appointment.patient_name}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {calculateEstimatedWaitTime(appointment.token_number, index)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {queueData.filter(a => a.status === 'WAITING').length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{queueData.filter(a => a.status === 'WAITING').length - 5} more patients
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Completed Patients List */}
          {queueData && queueData.filter(a => a.status === 'SERVED' && a.appointment_date === selectedDate).length > 0 && (
            <motion.div layout className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Completed Patients</h3>
              <motion.div layout className="space-y-2">
                <AnimatePresence>
                  {queueData
                    .filter(a => a.status === 'SERVED' && a.appointment_date === selectedDate)
                    .slice(-5) // Show last 5 completed patients
                    .map((appointment, index) => (
                      <motion.div 
                        key={appointment.id} 
                        layout
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200"
                      >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-green-600">✓</span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">T-{appointment.token_number}</span>
                            <span className="text-gray-600">{appointment.patient_name}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Completed
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {queueData.filter(a => a.status === 'SERVED').length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{queueData.filter(a => a.status === 'SERVED').length - 5} more completed
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Empty State - No Appointments */
        (() => {
          console.log('=== DEBUG: Empty State Rendering ===');
          console.log('queueData:', queueData);
          console.log('queueData length:', queueData?.length);
          console.log('Empty condition met:', !queueData || queueData.length === 0);
          console.log('====================================');
          return true;
        })() && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg font-medium">No appointments booked</p>
          <p className="text-gray-400 text-sm mt-2">
            There are no appointments scheduled for {new Date(selectedDate).toLocaleDateString()} 
            {selectedService && ` for this service`}
          </p>
        </div>
        )
      )}
    </motion.div>
  );
};

export default QueueSection;
