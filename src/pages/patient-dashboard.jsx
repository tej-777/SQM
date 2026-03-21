import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get medical problem from navigation state
  const medicalProblem = location?.state?.medicalProblem || null;
  console.log("Medical problem received:", medicalProblem);

  // State
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalServices, setHospitalServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showQueueStatus, setShowQueueStatus] = useState(false);
  const [bookingSelectedDate, setBookingSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [hospitalAvailabilityList, setHospitalAvailabilityList] = useState([]);
  const [loadingHospitalAvailability, setLoadingHospitalAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Load hospitals and services from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hospitals
        const hospitalsRes = await fetch(`${API_BASE}/public/hospitals`);
        const hospitalsData = await hospitalsRes.json();
        setHospitals(hospitalsData);

        // Fetch services
        const servicesRes = await fetch(`${API_BASE}/services`);
        const servicesData = await servicesRes.json();
        setHospitalServices(servicesData);

        // Set search results to all hospitals initially
        setSearchResults(hospitalsData);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
  }, [medicalProblem]);

  // Find service ID based on medical problem
  useEffect(() => {
    console.log("DEBUG: Service detection triggered with:", { medicalProblem, hospitalServicesLength: hospitalServices.length });
    if (medicalProblem && hospitalServices.length > 0) {
      // Comprehensive service mapping for all medical specialists
      const serviceMapping = {
        // Specialists
        "Visit Cardiologist - Heart": "3a25e4bd-bd34-44fd-afda-2659bf523e79", // Cardiology
        "Visit Pulmonologist - Lungs": "963c864d-2945-4423-8fc0-e887f36f4edc", // Pulmonology
        "Visit Neurologist - Brain & Nerves": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539", // Neurology
        "Visit Orthopedic - Bones & Joints": "97b416cb-7a60-490e-8ed5-9ce49f25bc46", // Orthopedics
        "Visit Dermatologist - Skin": "47aa8048-0c68-4ca4-b665-d7cf98c48c6f", // Dermatology
        "Visit Ophthalmologist - Eyes": "75b6e8fb-42b8-4331-b3ae-f8cb9a622411", // Radiology (closest match for eyes)
        "Visit ENT Specialist - Ears, Nose, Throat": "cd5e3f70-5612-408a-a20c-ff52597ca18e", // ENT
        "Visit Gastroenterologist - Digestive System": "04e91c8a-99d4-40ec-8984-bb4c97c93347", // Gastroenterology
        "Visit Endocrinologist - Hormones & Glands": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine (closest match)
        "Visit Nephrologist - Kidneys": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine (closest match)
        "Visit Psychiatrist - Mental Health": "777ca757-8c60-45bb-a65e-fe98c3be4af5", // Psychiatry
        "Visit Gynecologist - Women Health": "5779a609-03e2-4a56-b584-889d1732409d", // Gynecology
        "Visit Pediatrician - Children": "d5d2c603-d283-45ae-a3e9-39fa883e98bb", // Pediatrics
        "Visit Oncologist - Cancer": "342870ff-e9af-458b-b4cc-1f8cf26f363e", // Oncology
        "Visit Urologist - Urinary System": "85848c93-f2c6-4c59-a01a-c4a5537fcad9", // Urology
        "Visit Rheumatologist - Autoimmune & Joints": "97b416cb-7a60-490e-8ed5-9ce49f25bc46", // Orthopedics (closest match)
        "Visit General Physician - General Health": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
        "Visit Dentist - Dental": "75b6e8fb-42b8-4331-b3ae-f8cb9a622411", // Radiology (closest match)
        
        // Common problems mapping to General Medicine
        "Fever": "05dc3b32-9881-440d-8da4-2e7727f7dfc1",
        "Cough & Cold": "963c864d-2945-4423-8fc0-e887f36f4edc", // Pulmonology
        "Headache": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539", // Neurology
        "Stomach Pain": "04e91c8a-99d4-40ec-8984-bb4c97c93347", // Gastroenterology
        "Allergies": "47aa8048-0c68-4ca4-b665-d7cf98c48c6f", // Dermatology
        "Diabetes Checkup": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
        "Blood Pressure Check": "3a25e4bd-bd34-44fd-afda-2659bf523e79", // Cardiology
        "Mental Health": "777ca757-8c60-45bb-a65e-fe98c3be4af5", // Psychiatry
        "Injury/Accident": "535d5736-fff2-4ea2-aeef-47fa42f58eb5", // Emergency Medicine
        "Women Health": "5779a609-03e2-4a56-b584-889d1732409d", // Gynecology
        "Child Health": "d5d2c603-d283-45ae-a3e9-39fa883e98bb", // Pediatrics
        "General Checkup": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
        "Vaccination": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
        "Throat Pain": "cd5e3f70-5612-408a-a20c-ff52597ca18e", // ENT
        "Body Pain": "97b416cb-7a60-490e-8ed5-9ce49f25bc46", // Orthopedics
        "Fatigue": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
        "Nausea": "04e91c8a-99d4-40ec-8984-bb4c97c93347", // Gastroenterology
        "Dizziness": "483f1c55-d6f3-4092-ab5a-dc0e4bb12539", // Neurology
        "Sleep Problems": "777ca757-8c60-45bb-a65e-fe98c3be4af5", // Psychiatry
        "Weight Management": "05dc3b32-9881-440d-8da4-2e7727f7dfc1", // General Medicine
      };
      
      const serviceId = serviceMapping[medicalProblem];
      console.log("DEBUG: Mapped service ID:", serviceId);
      
      if (serviceId) {
        setSelectedServiceId(serviceId);
        console.log("DEBUG: Set selectedServiceId to:", serviceId);
      } else {
        console.log("DEBUG: No service mapping found for:", medicalProblem);
        // Fallback to General Medicine if no specific mapping found
        setSelectedServiceId("05dc3b32-9881-440d-8da4-2e7727f7dfc1");
        console.log("DEBUG: Fallback to General Medicine");
      }
    }
  }, [medicalProblem, hospitalServices]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]); // Don't show any hospitals when query is too short
      return;
    }

    const filtered = hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(query.toLowerCase()) ||
      hospital.city.toLowerCase().includes(query.toLowerCase()) ||
      hospital.state.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  // Handle hospital selection
  const selectSearchHospital = (hospital) => {
    setSelectedHospital(hospital);
    setSearchQuery(hospital.name);
    setShowDropdown(false);
  };

  // Check availability for selected date and hospital
  const checkAvailability = async (hospital, date) => {
    if (!hospital || !date) return;

    try {
      setLoadingAvailability(true);
      const response = await fetch(`${API_BASE_URL}/appointments/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospital_id: hospital.id,
          date: date.toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      setAvailabilityData(data);
    } catch (err) {
      console.error('Failed to check availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!patientName.trim() || !phoneNumber.trim()) {
      setBookingError('Please fill in all details');
      return;
    }

    try {
      setLoading(true);
      setBookingError('');

      // Create booking payload with hospital_id and service_id
      const payload = {
        hospital_id: bookingData.hospital.id,
        service_id: selectedServiceId,
        appointment_date: bookingData.date.toISOString().split('T')[0],
        patient_name: patientName,
        patient_phone: phoneNumber
      };

      // Add debug log before booking
      console.log("BOOKING PAYLOAD:", payload);

      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("DEBUG: Booking API response:", data);
      console.log("DEBUG: Response status:", response.status);
      console.log("DEBUG: Response ok:", response.ok);

      if (!response.ok) {
        console.log("DEBUG: Booking failed with error:", data.detail || 'Booking failed');
        throw new Error(data.detail || 'Booking failed');
      }

      console.log("DEBUG: Booking successful, preparing to redirect...");
      console.log("DEBUG: Appointment ID:", data.appointment_id);
      console.log("DEBUG: Token Number:", data.token_number);

      setShowBookingModal(false);
      setBookingData(null);
      setPatientName('');
      setPhoneNumber('');
      
      // Redirect to queue status page with appointment data
      console.log("DEBUG: Navigating to queue-status with state:", {
        appointment_id: data.appointment_id,
        token_number: data.token_number
      });
      
      navigate("/queue-status", {
        state: {
          appointment_id: data.appointment_id,
          token_number: data.token_number
        }
      });

      // Refresh hospital availability to update slot counts
      fetchHospitalAvailability();

    } catch (err) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close booking modal
  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingData(null);
    setBookingError('');
  };

  // Fetch hospital availability by service and date
  const fetchHospitalAvailability = async () => {
    if (!selectedServiceId || !bookingSelectedDate) {
      setHospitalAvailabilityList([]);
      setAvailabilityError('');
      return;
    }

    // Validate date
    const selectedDateObj = new Date(bookingSelectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDateObj < today) {
      setAvailabilityError('Please select a valid future date');
      setHospitalAvailabilityList([]);
      return;
    }

    try {
      setLoadingHospitalAvailability(true);
      setAvailabilityError('');
      
      const selectedDate = bookingSelectedDate.toISOString().split('T')[0];
      
      console.log("DEBUG: Selected Service:", selectedServiceId);
      console.log("DEBUG: Selected Date:", selectedDate);
      console.log("DEBUG: Calling API:", `/public/hospitals/hospitals-by-service?service_id=${selectedServiceId}&target_date=${selectedDate}`);
      console.log("DEBUG: API call verification - service_id:", selectedServiceId, "target_date:", selectedDate);
      
      const response = await fetch(
        `${API_BASE_URL}/public/hospitals/hospitals-by-service?service_id=${selectedServiceId}&target_date=${selectedDate}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("DEBUG: Hospitals response:", data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      // Fallback for demo: if no filtered hospitals, show all hospitals
      if (!data || data.length === 0) {
        console.warn("No filtered hospitals found, loading all hospitals for demo");
        try {
          const fallbackResponse = await fetch(`${API_BASE}/public/hospitals`);
          const fallbackData = await fallbackResponse.json();
          
          // Transform fallback data to match expected format
          const transformedFallback = fallbackData.map(hospital => ({
            hospital_id: hospital.id,
            hospital_name: hospital.name,
            total_slots: 0,
            booked_slots: 0,
            available_slots: 0,
            is_available: false
          }));
          
          setHospitalAvailabilityList(transformedFallback);
          console.log("DEBUG: Fallback hospitals loaded:", transformedFallback.length);
          
          // Show user message about demo mode
          setAvailabilityError(`No hospitals available for ${getServiceName(selectedServiceId)} on this date. Showing all hospitals for demo.`);
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
          setHospitalAvailabilityList([]);
          setAvailabilityError('Failed to load hospital availability. Please try again.');
        }
      } else {
        setHospitalAvailabilityList(data);
        console.log("DEBUG: Filtered hospitals loaded:", data.length);
        // Clear any previous error message when successful
        setAvailabilityError('');
      }
    } catch (err) {
      console.error('Error fetching hospital availability:', err);
      setAvailabilityError('Failed to load hospital availability. Please try again.');
      setHospitalAvailabilityList([]);
    } finally {
      setLoadingHospitalAvailability(false);
    }
  };

  // Call fetchHospitalAvailability when service ID and date are selected
  useEffect(() => {
    console.log("DEBUG: useEffect triggered with:", { selectedServiceId, bookingSelectedDate });
    
    if (!selectedServiceId || !bookingSelectedDate) {
      console.log("DEBUG: Missing required data, skipping fetch");
      return;
    }
    
    console.log("DEBUG: All data present, fetching hospitals");
    fetchHospitalAvailability();
  }, [selectedServiceId, bookingSelectedDate]);

  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = hospitalServices.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  // Handle hospital booking
  const handleBookAppointment = (hospital) => {
    if (!hospital.is_available || hospital.available_slots <= 0) {
      return;
    }
    
    // Set booking data for existing booking flow
    setBookingData({
      hospital: { id: hospital.hospital_id, name: hospital.hospital_name },
      date: bookingSelectedDate,
      availability: {
        total_slots: hospital.total_slots,
        booked_slots: hospital.booked_slots,
        available_slots: hospital.available_slots
      }
    });
    setShowBookingModal(true);
  };

  // Generate date options
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        dayName: dayNames[date.getDay()],
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === 0,
        isAvailable: true // This would come from backend
      });
    }
    return dates;
  };

  return (
    <section className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92%] md:w-[80%] flex items-center justify-between px-6 py-3 backdrop-blur-[10px] bg-transparent border border-blue-600/20 rounded-full z-50 transition-all duration-300">
        <div className="flex w-full items-center justify-between px-6">
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                TREFIX
              </span>
              <span className="hidden md:block text-xs text-gray-400">
                Smart Queue System
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-700">Patient Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/medical-problem')}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-md transition-all duration-300"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-4 md:mx-20 lg:mx-40 px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Medical Problem Display */}
          {medicalProblem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Medical Concern</p>
                  <p className="text-lg font-semibold text-blue-900">{medicalProblem}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Date Selection */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Appointment Date</h3>
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-12 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {generateDateOptions().map((dateOption, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log("DEBUG: Date clicked:", dateOption.date);
                      setBookingSelectedDate(dateOption.date);
                      console.log("DEBUG: Date state updated to:", dateOption.date);
                      if (selectedHospital) {
                        checkAvailability(selectedHospital, dateOption.date);
                      }
                    }}
                    className={`flex-shrink-0 w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                      bookingSelectedDate?.toDateString() === dateOption.date.toDateString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : dateOption.isAvailable
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-100 text-gray-700'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs font-medium">{dateOption.dayName}</div>
                    <div className="text-lg font-bold">{dateOption.day}</div>
                    <div className="text-xs">{dateOption.month}</div>
                    {dateOption.isToday && (
                      <div className="text-xs bg-blue-600 text-white px-1 rounded">Today</div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hospital Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            {selectedServiceId && bookingSelectedDate ? 'Available Hospitals' : 
             (!selectedServiceId || !bookingSelectedDate) ? 'Hospital Search' : 'Select Hospital'}
          </h2>
          
          {/* Search Input - Only show when no service/date selected */}
          {(!selectedServiceId || !bookingSelectedDate) && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by hospital name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(searchResults.length > 0)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Type at least 2 characters to search hospitals..."
                    className="w-full px-3 sm:px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                  />
                  
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 sm:max-h-64 overflow-y-auto">
                      {searchResults.map((hospital, index) => (
                        <div
                          key={hospital.id}
                          onClick={() => selectSearchHospital(hospital)}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{hospital.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {hospital.city}, {hospital.state}
                          </div>
                          {hospital.medicalRelevance > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              ✓ Relevant for {medicalProblem}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hospital List - Only show when actively searching */}
              {searchQuery && searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((hospital, index) => (
                    <motion.div
                      key={hospital.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => selectSearchHospital(hospital)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                          <p className="text-sm text-gray-600">{hospital.city}, {hospital.state}</p>
                          {hospital.medicalRelevance > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ✓ Relevant for {medicalProblem}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hospital.medical_relevance || 'General'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Service/Date Selection Message */}
          {(!selectedServiceId || !bookingSelectedDate) && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Select a date to see available hospitals for {selectedServiceId ? getServiceName(selectedServiceId) : 'your selected service'}</p>
            </div>
          )}

          {/* Hospital Availability Results - Only show when service and date are selected */}
          {selectedServiceId && bookingSelectedDate && (
            <>
              {/* Error State */}
              {availabilityError && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700">{availabilityError}</p>
                </div>
              )}

              {/* Loading State */}
              {loadingHospitalAvailability ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading hospital availability...</p>
                  <p className="text-gray-400 text-sm mt-1">Please wait while we check available slots</p>
                </div>
              ) : hospitalAvailabilityList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hospitalAvailabilityList.map((hospital, index) => (
                  <motion.div
                    key={hospital.hospital_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white rounded-xl border-2 shadow-sm transition-all duration-200 ${
                      !hospital.is_available 
                        ? 'border-gray-200 opacity-75' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* Not Available Badge */}
                    {!hospital.is_available && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Not Available Today
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Hospital Name */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{hospital.hospital_name}</h3>
                      
                      {/* Service Name */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {getServiceName(selectedServiceId)}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Date:</span> {bookingSelectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>

                      {/* Slots Information */}
                      <div className="space-y-2 mb-4">
                        {hospital.is_available ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center text-green-600">
                                🟢 Available: <span className="font-semibold ml-1">{hospital.available_slots}</span>
                              </span>
                              <span className="flex items-center text-red-600">
                                🔴 Booked: <span className="font-semibold ml-1">{hospital.booked_slots}</span>
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              Total Slots: {hospital.total_slots}
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-gray-500 text-sm">
                            <p>No slots available for this date</p>
                          </div>
                        )}
                      </div>

                      {/* Book Now Button */}
                      <button
                        onClick={() => handleBookAppointment(hospital)}
                        disabled={!hospital.is_available || hospital.available_slots <= 0}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          hospital.is_available && hospital.available_slots > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {hospital.is_available && hospital.available_slots > 0 ? 'Book Now' : 'Not Available'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : selectedServiceId && bookingSelectedDate && !availabilityError ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals available</h3>
                <p className="text-gray-500">No hospitals are offering this service on the selected date.</p>
                <p className="text-gray-400 text-sm mt-2">Try selecting a different date.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a date</h3>
                <p className="text-gray-500">Choose a date to see available hospitals for your selected service.</p>
              </div>
            )}
            </>
          )}
        </motion.div>

        {/* Availability Display */}
        {availabilityData && selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Availability for {selectedHospital.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{availabilityData.available_slots || 0}</div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{availabilityData.estimated_wait || '0 min'}</div>
                <div className="text-sm text-gray-600">Estimated Wait</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{availabilityData.max_tokens || 0}</div>
                <div className="text-sm text-gray-600">Max Tokens</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedHospital && handleBookAppointment({
                  hospital_id: selectedHospital.id,
                  hospital_name: selectedHospital.name,
                  is_available: true,
                  available_slots: availabilityData?.available_slots || 0,
                  total_slots: availabilityData?.total_slots || 0,
                  booked_slots: availabilityData?.booked_slots || 0
                })}
                disabled={!selectedHospital}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                Book Appointment
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && bookingData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseBookingModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Appointment</h3>
              <p className="text-gray-600">Please review your appointment details</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Hospital:</span>
                <span className="font-medium">{bookingData.hospital.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{bookingData.hospital.district}, {bookingData.hospital.state}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingData.date.toLocaleDateString()}</span>
              </div>
              <div className="py-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="py-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Booking Error Display */}
            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {bookingError}
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                onClick={handleCloseBookingModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default PatientDashboard;
