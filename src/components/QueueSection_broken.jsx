import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFns } from 'react-calendar';

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
      
      const response = await fetch(`${API_BASE_URL}/queue/call-next`, {
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
      
      const response = await fetch(`${API_BASE_URL}/queue/skip`, {
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
        return;
      }
      
      console.log(`DEBUG: Fetching queue for service ${serviceToFetch} on ${dateToFetch}`);
      
      // Fetch queue for SELECTED hospital service only
      const apiUrl = `${API_BASE_URL}/queue/status/${serviceToFetch}/${dateToFetch}`;
      console.log("DEBUG: Queue API request URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error(`DEBUG: Failed to fetch for service ${serviceToFetch}:`, response.status);
        return [];
      }
      
      const data = await response.json();
      console.log(`DEBUG: Queue data for service ${serviceToFetch}:`, data);
      
      // Debug: Check if service_name and hospital_name are present
      if (data.length > 0) {
        console.log(`DEBUG: First patient data:`, data[0]);
        console.log(`DEBUG: service_name:`, data[0].service_name);
        console.log(`DEBUG: hospital_name:`, data[0].hospital_name);
      }
      
      // Add service information to each appointment (prioritize backend service_name, then fallback)
      const service = hospitalServices.find(s => s.id === serviceToFetch);
      const result = data.map(appointment => ({
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
    )
  }

  // Enhanced Date Picker with Month Navigation
  const EnhancedDatePicker = ({ selectedDate, onDateChange }) => {
    const [showMonthSelector, setShowMonthSelector] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const handleMonthChange = (direction) => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (direction === 'next' ? 1 : -1), 1));
    };
    
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
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
              max={new Date().toISOString().split('T')[0]}
            />
            <button
              onClick={() => setShowMonthSelector(!showMonthSelector)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
            >
              📅 Month View
            </button>
      const handleMonthChange = (direction) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (direction === 'next' ? 1 : -1), 1));
      };
      
      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
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
                max={new Date().toISOString().split('T')[0]}
              />
              <button
                onClick={() => setShowMonthSelector(!showMonthSelector)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
              >
                📅 Month View
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Showing appointments for: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          {showMonthSelector && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleMonthChange('previous')}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  ← Previous Month
                </button>
                <h3 className="text-lg font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => handleMonthChange('next')}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                >
                  Next Month →
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center p-2 rounded-lg border">
                    <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                    <div className="text-sm">
                      {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };
    
  return (
    <motion.div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <EnhancedDatePicker
                selectedDate={selectedDate}
                onDateChange={(date) => setSelectedDate(date)}
              />
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Today
            </button>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a service...</option>
              {hospitalServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.service_name || `Service ${service.id?.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Showing appointments for: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
        </div>
      </div>

      {queueData && queueData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Token */}
          <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Now Serving</p>
                <p className="text-3xl font-bold">
                  {(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED');
                    return calledPatient ? `T-${calledPatient.token_number}` : 'T-0';
                  })()}
                </p>
                <p className="text-indigo-100 text-sm mt-1">
                  {(() => {
                    const calledPatient = queueData?.find(p => p.status === 'CALLED');
                    return calledPatient ? calledPatient.patient_name : 'No patient';
                  })()}
                </p>
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
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {queueData ? queueData.filter(a => a.status === 'WAITING').length : 0}
              </p>
              <p className="text-sm text-gray-600">Waiting</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  const calledPatient = queueData?.find(a => a.status === 'CALLED');
                  return calledPatient ? `T-${calledPatient.token_number}` : '-';
                })()}
              </p>
              <p className="text-sm text-gray-600">
                {queueData?.find(a => a.status === 'CALLED') ? 'Now Serving' : 'Next In'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {queueData ? queueData.filter(a => a.status === 'SERVED').length : 0}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>

          {/* Waiting Queue List */}
          {(() => {
            const waitingPatients = queueData && queueData.filter(a => a.status === 'WAITING');
            console.log('DEBUG: Current queueData:', queueData);
            console.log('DEBUG: Waiting patients:', waitingPatients);
            console.log('DEBUG: Waiting patients count:', waitingPatients?.length || 0);
            
            return waitingPatients && waitingPatients.length > 0;
          })() && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Waiting Queue</h3>
              <div className="space-y-2">
                {queueData
                  .filter(a => a.status === 'WAITING')
                  .slice(0, 5) // Show first 5 waiting patients
                  .map((appointment, index) => (
                    <div key={appointment.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
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
                    </div>
                  ))}
                {queueData.filter(a => a.status === 'WAITING').length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{queueData.filter(a => a.status === 'WAITING').length - 5} more patients
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Patients List */}
          {queueData && queueData.filter(a => a.status === 'SERVED').length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Completed Patients</h3>
              <div className="space-y-2">
                {queueData
                  .filter(a => a.status === 'SERVED')
                  .slice(-5) // Show last 5 completed patients
                  .map((appointment, index) => (
                    <div key={appointment.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
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
                    </div>
                  ))}
                {queueData.filter(a => a.status === 'SERVED').length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    +{queueData.filter(a => a.status === 'SERVED').length - 5} more completed
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}


      {/* Empty State */}
      {(!queueData || queueData.length === 0) && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500">No patients in queue</p>
        </div>
      )}
    </motion.div>
  );
};

export default QueueSection;
