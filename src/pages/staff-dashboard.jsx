import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';
import QueueSection from '../components/QueueSection';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { staffApi } from '../services/api';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { token, login, logout, isAuthenticated, isStaff } = useAuth();
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('queue');
  const [staffData, setStaffData] = useState(null);
  const [currentToken, setCurrentToken] = useState('T-12');
  const [currentPatient, setCurrentPatient] = useState({
    name: 'Sarah Johnson',
    phone: '9876543210'
  });
  const [servingStatus, setServingStatus] = useState('NOW SERVING');
  const [queueStatus, setQueueStatus] = useState('ACTIVE');
  const [waitingQueue, setWaitingQueue] = useState([
    { id: 'T-13', name: 'John Doe', phone: '9876543211' },
    { id: 'T-14', name: 'Jane Smith', phone: '9876543212' },
    { id: 'T-15', name: 'Mike Johnson', phone: '9876543213' }
  ]);
  const [counters, setCounters] = useState({ served: 2, avgTime: 5 });

  // Availability management state
  const [hospitalServices, setHospitalServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [totalSlots, setTotalSlots] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');
  const [existingAvailabilities, setExistingAvailabilities] = useState([]);

  // Use current date and first available hospital service
  const [selectedHospitalServiceId, setSelectedHospitalServiceId] = useState('');
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const appointmentDate = getCurrentDate();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  // Fallback: Set a default hospital service ID if none is set after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!selectedHospitalServiceId) {
        if (hospitalServices.length > 0) {
          console.log("DEBUG: Fallback - setting first hospital service ID from services");
          setSelectedHospitalServiceId(hospitalServices[0].id);
        } else {
          console.log("DEBUG: Fallback - setting hardcoded hospital service ID for testing");
          // Hardcoded fallback for testing - replace with actual service ID from your database
          setSelectedHospitalServiceId("729a6827-d066-4f4c-868a-e991566d1a99");
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedHospitalServiceId, hospitalServices]);

  // Fetch staff profile
  const fetchStaffProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token in localStorage:", localStorage.getItem("token"));
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const staffProfile = await response.json();
        console.log("Staff profile:", staffProfile);
        setStaffData(staffProfile);
        
        // Store staff profile data in localStorage for other functions to use
        localStorage.setItem("staff_user", JSON.stringify(staffProfile));
        
        // Fetch hospital services after staff data is loaded
        fetchHospitalServices();
        fetchExistingAvailabilities();
      } else {
        console.error("Failed to fetch staff profile");
        // Fallback to mock data for development - use new hospital with both services
        const mockData = {
          id: 'demo_1',
          hospital_name: 'Hospital',
          staff_id: 'T',
          staffId: 'T',
          district: 'KAKINADA',
          mandal: 'Kakinada - U',
          verification_badge: '⭐⭐⭐⭐',
          verified_at: new Date().toISOString(),
          hospital_id: '729a6827-d066-4f4c-868a-e991566d1a99' // New hospital with both services
        };
        setStaffData(mockData);
        localStorage.setItem("staff_user", JSON.stringify(mockData));
        fetchHospitalServices();
        fetchExistingAvailabilities();
      }
    } catch (err) {
      console.error('Error fetching staff profile:', err);
      // Fallback to mock data for development - use new hospital with both services
      const mockData = {
        id: 'demo_1',
        hospital_name: 'Hospital',
        staff_id: 'T',
        staffId: 'T',
        district: 'KAKINADA',
        mandal: 'Kakinada - U',
        verification_badge: '⭐⭐⭐⭐',
        verified_at: new Date().toISOString(),
        hospital_id: '729a6827-d066-4f4c-868a-e991566d1a99' // New hospital with both services
      };
      setStaffData(mockData);
      localStorage.setItem("staff_user", JSON.stringify(mockData));
      fetchHospitalServices();
      fetchExistingAvailabilities();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for token in localStorage first (for persistence)
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken) {
      navigate('/staff-login');
      return;
    }
    
    // Update AuthContext with stored token if not already set
    if (!token) {
      login(storedToken);
    }

    // Fetch staff profile only (queue is handled by QueueSection component)
    fetchStaffProfile();
  }, [token, navigate, login]);

  // Remove global polling - queue will be handled by QueueSection component

  // Fetch hospital services for availability management
  const fetchHospitalServices = async () => {
    try {
      // Get hospital_id from logged-in staff user data
      const staffUserStr = localStorage.getItem("staff_user");
      if (!staffUserStr || staffUserStr === "undefined" || staffUserStr === "null") {
        console.error("No staff user data found in localStorage");
        setError("Staff user data not found. Please login again.");
        navigate('/staff-login');
        return;
      }
      
      const staffUser = JSON.parse(staffUserStr);
      const hospitalId = staffUser?.hospital_id;
      
      if (!hospitalId) {
        console.error("No hospital_id found in staff user data");
        setError("Unable to determine hospital for this staff member");
        return;
      }
      
      console.log("Fetching hospital services for hospital_id:", hospitalId);
      
      const response = await fetch(`${API_BASE_URL}/hospital-services/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Hospital services API response:", data);
        
        // Defensive checks
        if (!data || !Array.isArray(data)) {
          console.error("Invalid API response format:", data);
          setHospitalServices([]);
          return;
        }
        
        if (data.length === 0) {
          console.log("No services configured for this hospital");
          setHospitalServices([]);
          return;
        }
        
        setHospitalServices(data);
        console.log(`Loaded ${data.length} hospital services`);
        
        // Set the first hospital service ID as default for queue display
        if (data.length > 0 && !selectedHospitalServiceId) {
          console.log("DEBUG: Setting default hospital service:", data[0]);
          setSelectedHospitalServiceId(data[0].id);
          console.log("DEBUG: Set default hospital service ID for queue:", data[0].id);
        } else {
          console.log("DEBUG: Not setting default service. Data length:", data.length, "selectedHospitalServiceId:", selectedHospitalServiceId);
        }
      } else {
        console.error("API error:", response.status, response.statusText);
        setHospitalServices([]);
      }
    } catch (err) {
      console.error('Error fetching hospital services:', err);
      setHospitalServices([]);
    }
  };

  // Handle availability creation
  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !availabilityDate || !totalSlots) {
      setAvailabilityError('Please fill all fields');
      return;
    }
    
    try {
      setAvailabilityLoading(true);
      setAvailabilityError('');
      setAvailabilitySuccess('');
      
      const payload = {
        hospital_service_id: selectedService,
        date: availabilityDate,
        total_slots: parseInt(totalSlots)
      };
      
      const response = await fetch(`${API_BASE_URL}/appointments/availability/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setAvailabilityError(data.detail || 'Failed to create availability');
        return;
      }
      
      setAvailabilitySuccess('Availability created successfully!');
      // Reset form
      setSelectedService('');
      setAvailabilityDate('');
      setTotalSlots('');
      
      // Refresh existing availabilities
      fetchExistingAvailabilities();
      
    } catch (err) {
      setAvailabilityError('Network error. Please try again.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Fetch existing availabilities
  const fetchExistingAvailabilities = async () => {
    try {
      const hospitalId = staffData?.hospital_id || '729a6827-d066-4f4c-868a-e991566d1a99';
      
      const response = await fetch(`${API_BASE_URL}/appointments/availability/hospital/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Existing availabilities:", data);
        setExistingAvailabilities(data);
      } else {
        console.error("Failed to fetch existing availabilities");
        setExistingAvailabilities([]);
      }
    } catch (err) {
      console.error('Error fetching existing availabilities:', err);
      setExistingAvailabilities([]);
    }
  };

  // Update totalSlots when service is selected
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    const selectedServiceData = hospitalServices.find(service => service.id === serviceId);
    if (selectedServiceData) {
      setTotalSlots(selectedServiceData.default_max_tokens_per_day || '');
    } else {
      setTotalSlots('');
    }
  };

  // Load services on component mount
  useEffect(() => {
    // Simple authentication check - only redirect if token is missing
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      console.log('No token found, redirecting to login');
      navigate('/staff-login');
      return;
    }
    
    // Fetch hospital services when staff user data is available
    try {
      const staffUserStr = localStorage.getItem("staff_user");
      if (staffUserStr && staffUserStr !== "undefined" && staffUserStr !== "null") {
        const staffUser = JSON.parse(staffUserStr);
        if (staffUser?.hospital_id && token) {
          fetchHospitalServices();
          fetchExistingAvailabilities(); // Add this to load existing availabilities on mount
        }
      }
    } catch (error) {
      console.error('Error parsing staff user data:', error);
      // If staff user data is invalid, redirect to login
      navigate('/staff-login');
    }
  }, [token]);

  const handleLogout = () => {
    // Clear authentication data
    logout();
    
    // Redirect to login
    navigate('/staff-login');
  };

  const handleCallNext = async () => {
    try {
      await staffApi.callNext(
        {
          hospital_service_id: hospitalServiceId,
          appointment_date: appointmentDate,
        },
        token
      );
      
      // Queue will be updated automatically via event system
    } catch (err) {
      console.error("Call next failed:", err);
    }
  };

  const handleSkip = () => {
    if (waitingQueue.length > 0) {
      setWaitingQueue(waitingQueue.slice(1));
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/availability/${availabilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAvailabilitySuccess('Availability deleted successfully');
        setAvailabilityError('');
        // Refresh the availabilities list
        fetchExistingAvailabilities();
        // Clear success message after 3 seconds
        setTimeout(() => setAvailabilitySuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setAvailabilityError(errorData.detail || 'Failed to delete availability');
        setAvailabilitySuccess('');
      }
    } catch (err) {
      setAvailabilityError('Error deleting availability');
      setAvailabilitySuccess('');
      console.error('Delete availability error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-lg">
          {error}
        </div>
      )}
      <Header 
        showNavigation={false} 
        showActions={false}
        customActions={
          <>
            <motion.button
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Back to Home
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Logout
            </motion.button>
          </>
        }
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-4 sm:pb-8">
        
        {/* Main Service Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-4 sm:mb-6">
          {/* Service Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Hospital Name</p>
                  <p className="text-base sm:text-lg font-bold">{staffData?.hospital_name || 'Demo Hospital 1'}</p>
                </div>
                <div className="border-l-2 border-white/60 pl-2 sm:pl-4">
                  <p className="text-xs sm:text-sm opacity-90">Services</p>
                  <p className="text-base sm:text-lg font-bold text-sm sm:text-base">
                    {hospitalServices.length > 0 
                      ? hospitalServices.map((service, index) => (
                          <React.Fragment key={service.id}>
                            {service.service_name}
                            {index < hospitalServices.length - 1 && ', '}
                          </React.Fragment>
                        ))
                      : 'Loading services...'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-white/20 hover:bg-white/25 rounded-lg text-white font-medium transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Queue Section - Now handles multiple services */}
          <QueueSection 
            hospitalServices={hospitalServices}
            appointmentDate={appointmentDate} 
          />
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">CONTROLS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Counters</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={counters.served}
                  onChange={(e) => setCounters(prev => ({ ...prev, served: parseInt(e.target.value) || 0 }))}
                  className="w-16 sm:w-20 px-2 sm:px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-sm sm:text-base"
                />
                <span className="text-slate-600 text-xs sm:text-sm">served</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Avg Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={counters.avgTime}
                  onChange={(e) => setCounters(prev => ({ ...prev, avgTime: parseInt(e.target.value) || 0 }))}
                  className="w-16 sm:w-20 px-2 sm:px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-sm sm:text-base"
                />
                <span className="text-slate-600 text-xs sm:text-sm">min</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Queue Status</label>
              <div className="flex items-center gap-2">
                <select
                  value={queueStatus}
                  onChange={(e) => setQueueStatus(e.target.value)}
                  className="flex-1 px-2 sm:px-3 py-2 border border-slate-300 rounded-lg font-medium text-xs sm:text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
                <button className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Management Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">MANAGE AVAILABILITY</h3>
          
          {availabilityError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {availabilityError}
            </div>
          )}
          
          {availabilitySuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {availabilitySuccess}
            </div>
          )}
          
          <form onSubmit={handleCreateAvailability} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a service...</option>
                  {hospitalServices.length > 0 ? (
                    hospitalServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.service_name || 'Unknown Service'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No services configured</option>
                  )}
                </select>
              </div>
              
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Total Slots */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Slots</label>
                <input
                  type="text"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  min="1"
                  max="100"
                  placeholder="Default slots will auto-fill from service settings"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={availabilityLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {availabilityLoading ? 'Creating...' : 'Create Availability'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Existing Availabilities Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">EXISTING AVAILABILITIES</h3>
        
        {existingAvailabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No availabilities created yet</p>
            <p className="text-sm mt-2">Create your first availability using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Slots</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Booked Slots</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Available</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingAvailabilities.map((availability, index) => (
                  <tr key={availability.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {availability.service_name || 'Unknown Service'}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {new Date(availability.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm font-medium">
                      {availability.total_slots}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {availability.booked_slots || 0}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-green-600 font-medium">
                      {availability.total_slots - (availability.booked_slots || 0)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        availability.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {availability.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteAvailability(availability.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default StaffDashboard;
