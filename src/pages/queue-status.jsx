import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import { swManager } from '../utils/serviceWorker';

const QueueStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location?.state?.appointment_id;
  const tokenNumber = location?.state?.token_number;
  const previousPeopleAhead = useRef(null);
  const notificationPermissionGranted = useRef(false);

  console.log("DEBUG: Queue Status - Location state:", location?.state);
  console.log("DEBUG: Queue Status - Appointment ID:", appointmentId);
  console.log("DEBUG: Queue Status - Token Number:", tokenNumber);

  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backgroundNotificationsEnabled, setBackgroundNotificationsEnabled] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(0); // STEP 2: Create countdown state

  // STEP 5: Format time display helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`; 
  };

  // Request notification permission and check Service Worker
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          notificationPermissionGranted.current = true;
          console.log('DEBUG: Notification permission granted');
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      notificationPermissionGranted.current = true;
    }

    // Check Service Worker readiness
    const checkServiceWorker = setInterval(() => {
      if (swManager.isReady()) {
        setServiceWorkerReady(true);
        clearInterval(checkServiceWorker);
        console.log('DEBUG: Service Worker ready for background notifications');
      }
    }, 1000);

    return () => clearInterval(checkServiceWorker);
  }, []);

  // STEP 3: Convert minutes to seconds when API data is received
  useEffect(() => {
    if (queueData?.estimatedWaitTime !== undefined) {
      setEtaSeconds(queueData.estimatedWaitTime * 60);
      console.log("DEBUG: ETA converted to seconds:", queueData.estimatedWaitTime * 60);
    }
  }, [queueData]);

  // STEP 4: Create countdown timer that runs every second
  useEffect(() => {
    if (etaSeconds <= 0) return;

    const interval = setInterval(() => {
      setEtaSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [etaSeconds]);

  // Subscribe to background notifications when queue data is available
  useEffect(() => {
    if (queueData && serviceWorkerReady && notificationPermissionGranted.current) {
      const appointmentData = {
        appointmentId: appointmentId,
        tokenNumber: queueData.token,
        hospitalName: queueData.hospital,
        serviceName: queueData.service,
        patientName: queueData.name
      };

      // Subscribe to background notifications
      const success = swManager.subscribeToQueue(appointmentData);
      if (success) {
        setBackgroundNotificationsEnabled(true);
        console.log('DEBUG: Background notifications enabled for appointment:', appointmentId);
      } else {
        console.log('DEBUG: Failed to enable background notifications, falling back to in-app only');
        setBackgroundNotificationsEnabled(false);
      }
    }

    // Cleanup on unmount
    return () => {
      if (appointmentId && backgroundNotificationsEnabled) {
        try {
          swManager.unsubscribeFromQueue(appointmentId);
          setBackgroundNotificationsEnabled(false);
        } catch (error) {
          console.log('DEBUG: Error unsubscribing from queue:', error);
        }
      }
    };
  }, [queueData, serviceWorkerReady, appointmentId, backgroundNotificationsEnabled]);

  // Show browser notification
  const showNotification = (title, body, icon = null) => {
    if (notificationPermissionGranted.current && 'Notification' in window) {
      const options = {
        body: body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'queue-update', // Prevent duplicate notifications
        requireInteraction: true, // Keep notification visible until user interacts
      };

      const notification = new Notification(title, options);
      
      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  // Redirect to home if no appointment_id
  useEffect(() => {
    if (!appointmentId) {
      navigate('/');
    }
  }, [appointmentId, navigate]);

  // Fetch queue status
  const fetchQueueStatus = async () => {
    if (!appointmentId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/queue/patient/${appointmentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }
      
      const data = await response.json();
      
      console.log("DEBUG: Queue Status API Response:", data);
      console.log("DEBUG: Estimated wait time from backend:", data.estimated_wait_time);
      
      // STEP 7: Sync with API updates - check if ETA differs significantly
      const newEtaSeconds = data.estimated_wait_minutes * 60;
      const currentEtaMinutes = Math.floor(etaSeconds / 60);
      const etaDiff = Math.abs(currentEtaMinutes - data.estimated_wait_minutes);
      
      // Update ETA if difference is more than 1 minute (to avoid constant resets)
      if (etaDiff > 1) {
        console.log("DEBUG: ETA sync - updating from", currentEtaMinutes, "to", data.estimated_wait_minutes);
        setEtaSeconds(newEtaSeconds);
      }
      
      setQueueData({
        hospital: data.hospital_name,
        service: data.service_name,
        name: data.patient_name,
        phone: data.patient_phone,
        token: data.token_number,
        peopleAhead: data.people_ahead,
        estimatedWaitTime: data.estimated_wait_minutes,
        status: data.status
      });
      
      // Check for queue changes and send notifications
      if (previousPeopleAhead.current !== null && previousPeopleAhead.current !== data.people_ahead) {
        const oldPosition = previousPeopleAhead.current;
        const newPosition = data.people_ahead;
        
        console.log('DEBUG: Queue position changed from', oldPosition, 'to', newPosition);
        
        // Send notification based on queue change
        if (newPosition === 0) {
          showNotification(
            '🎉 You\'re Next in Queue!',
            `Token T-${data.token_number} - Please be ready to be called at ${data.hospital_name}`,
            null
          );
        } else if (oldPosition > newPosition) {
          // Queue moved forward
          const positionsMoved = oldPosition - newPosition;
          showNotification(
            '📉 Queue Updated!',
            `Token T-${data.token_number} - ${positionsMoved} position${positionsMoved > 1 ? 's' : ''} moved forward! ${newPosition} people ahead`,
            null
          );
        }
      }
      
      // Special notification for first time load if close to front
      if (previousPeopleAhead.current === null && data.people_ahead <= 3) {
        showNotification(
          '⏰ Queue Status Update',
          `Token T-${data.token_number} - You're ${data.people_ahead === 0 ? 'next!' : data.people_ahead + ' people ahead'} at ${data.hospital_name}`,
          null
        );
      }
      
      previousPeopleAhead.current = data.people_ahead;
      
      console.log("DEBUG: Queue Data after mapping:", {
        estimatedWaitTime: data.estimated_wait_time,
        peopleAhead: data.people_ahead,
        token: data.token_number,
        timestamp: new Date().toISOString()
      });
      setError('');
    } catch (err) {
      setError('Unable to fetch queue status.');
      setQueueData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds with proper cleanup
  useEffect(() => {
    if (!appointmentId) return;
    
    fetchQueueStatus();
    
    const interval = setInterval(fetchQueueStatus, 10000);
    
    // Cleanup function
    return () => {
      console.log('DEBUG: Cleaning up queue status polling');
      clearInterval(interval);
    };
  }, [appointmentId]);

  if (!appointmentId) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Queue Status</h1>

          {loading && !queueData && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading queue status...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {queueData && (
            <div className="space-y-6">
              {/* Hospital and Service Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Hospital:</span>
                    <p className="font-medium text-gray-900">{queueData.hospital}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Service:</span>
                    <p className="font-medium text-gray-900">{queueData.service}</p>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{queueData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900">{queueData.phone}</p>
                  </div>
                </div>
              </div>

              {/* Token Info */}
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Token</h2>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  T-{queueData.token}
                </div>
                <div className="text-sm text-gray-600">
                  Status: <span className="font-medium capitalize">{queueData.status.toLowerCase()}</span>
                </div>
              </div>

              {/* Queue Info */}
              <div className={`${queueData.peopleAhead === 0 ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg p-6`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Queue Information</h2>
                
                {queueData.peopleAhead === 0 ? (
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <div className="text-2xl font-bold text-green-600 mb-2">You're next in queue!</div>
                    <div className="text-sm text-gray-600">Please be ready to be called</div>
                  </div>
                ) : queueData.status === "CALLED" ? (
                  // STEP 8: Handle "CALLED" status
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏥</div>
                    <div className="text-2xl font-bold text-red-600 mb-2">Now Serving!</div>
                    <div className="text-sm text-gray-600">Please proceed to the counter</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{queueData.peopleAhead}</div>
                      <div className="text-sm text-gray-600">People Ahead</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 transition-all duration-300 ease-in-out">
                        {etaSeconds > 0 ? formatTime(etaSeconds) : "0:00"}
                      </div>
                      <div className="text-sm text-gray-600">Est. Wait (MM:SS)</div>
                    </div>
                  </div>
                )}
                
                {queueData.peopleAhead > 0 && queueData.peopleAhead <= 3 && (
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium text-center">
                      ⏰ You're almost there! Only {queueData.peopleAhead} {queueData.peopleAhead === 1 ? 'person' : 'people'} ahead
                    </p>
                  </div>
                )}
              </div>

              {/* Auto-refresh indicator */}
              <div className="text-center text-sm text-gray-500">
                <div className="inline-flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Auto-refreshing every 10 seconds
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                
                {/* Notification Permission Status */}
                <div className="mt-3 flex flex-col items-center space-y-2">
                  {backgroundNotificationsEnabled ? (
                    <div className="flex items-center text-green-600 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Background notifications active
                    </div>
                  ) : notificationPermissionGranted.current ? (
                    <div className="flex items-center text-blue-600 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      In-app notifications only
                    </div>
                  ) : 'Notification' in window ? (
                    <button
                      onClick={() => {
                        Notification.requestPermission().then(permission => {
                          if (permission === 'granted') {
                            notificationPermissionGranted.current = true;
                            showNotification('✅ Notifications Enabled!', 'You will receive queue updates on this device.');
                          }
                        });
                      }}
                      className="flex items-center text-orange-600 text-xs hover:text-orange-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      Enable notifications
                    </button>
                  ) : (
                    <div className="flex items-center text-gray-400 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Notifications not supported
                    </div>
                  )}
                  
                  {serviceWorkerReady && notificationPermissionGranted.current && !backgroundNotificationsEnabled && (
                    <button
                      onClick={() => {
                        if (queueData) {
                          const appointmentData = {
                            appointmentId: appointmentId,
                            tokenNumber: queueData.token,
                            hospitalName: queueData.hospital,
                            serviceName: queueData.service,
                            patientName: queueData.name
                          };
                          const success = swManager.subscribeToQueue(appointmentData);
                          if (success) {
                            setBackgroundNotificationsEnabled(true);
                            showNotification('📱 Background Notifications Enabled!', 'You\'ll receive updates even when the tab is closed.');
                          }
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Enable background notifications
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Back to Home
                </button>
                <button
                  onClick={fetchQueueStatus}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QueueStatus;
