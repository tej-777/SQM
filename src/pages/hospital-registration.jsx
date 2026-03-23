import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { API_BASE_URL } from '../config.js';

const HospitalRegistration = () => {
  const navigate = useNavigate();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Hospital Identity
    hospital_name: '',
    registration_number: '',
    hospital_type: 'private',
    established_year: '',
    
    // Step 2 - Contact & Location
    official_email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Step 3 - Admin Account
    admin_name: '',
    admin_email: '',
    password: '',
    confirm_password: '',
    staff_id: '',
    staff_password: '',
    confirm_staff_password: '',
    
    // Step 4 - Services
    services: []
  });

  // Available services
  const [availableServices, setAvailableServices] = useState([]);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('🔍 Fetching services from:', `${API_BASE_URL}/services/`);
        const response = await fetch(`${API_BASE_URL}/services/`);
        console.log('📡 Services API response:', response);
        
        if (response.ok) {
          const services = await response.json();
          console.log('✅ Services fetched successfully:', services);
          setAvailableServices(services);
        } else {
          console.error('❌ Services API error:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Services API error details:', errorData);
        }
      } catch (error) {
        console.error('❌ Error fetching services:', error);
      }
    };
    
    fetchServices();
  }, []);

  // Validation errors per step
  const [stepErrors, setStepErrors] = useState({
    1: {},
    2: {},
    3: {},
    4: {}
  });

  // Steps configuration
  const steps = [
    { id: 1, title: 'Hospital Identity', description: 'Basic information about your hospital' },
    { id: 2, title: 'Contact & Location', description: 'How to reach your hospital' },
    { id: 3, title: 'Admin Account', description: 'Create administrator access' },
    { id: 4, title: 'Services & Capacity', description: 'Select services and set capacity' }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (stepErrors[currentStep][name]) {
      setStepErrors(prev => ({
        ...prev,
        [currentStep]: {
          ...prev[currentStep],
          [name]: ''
        }
      }));
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.hospital_name.trim()) errors.hospital_name = 'Hospital name is required';
      if (!formData.registration_number.trim()) errors.registration_number = 'Registration number is required';
      if (!formData.hospital_type) errors.hospital_type = 'Hospital type is required';
    }
    
    if (step === 2) {
      if (!formData.official_email.trim()) errors.official_email = 'Official email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.official_email)) {
        errors.official_email = 'Please enter a valid email';
      }
      
      if (!formData.phone_number.trim()) errors.phone_number = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone_number.replace(/\D/g, ''))) {
        errors.phone_number = 'Please enter a valid 10-digit phone number';
      }
      
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = 'Please enter a valid 6-digit pincode';
      }
    }
    
    if (step === 3) {
      if (!formData.admin_name.trim()) errors.admin_name = 'Admin name is required';
      if (!formData.admin_email.trim()) errors.admin_email = 'Admin email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
        errors.admin_email = 'Please enter a valid email';
      }
      
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.confirm_password) errors.confirm_password = 'Please confirm password';
      else if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
      
      // Staff ID and Password validation
      if (!formData.staff_id.trim()) errors.staff_id = 'Staff ID is required';
      
      if (!formData.staff_password) errors.staff_password = 'Staff password is required';
      else if (formData.staff_password.length < 8) {
        errors.staff_password = 'Staff password must be at least 8 characters';
      }
      
      if (!formData.confirm_staff_password) errors.confirm_staff_password = 'Please confirm staff password';
      else if (formData.staff_password !== formData.confirm_staff_password) {
        errors.confirm_staff_password = 'Staff passwords do not match';
      }
    }
    
    if (step === 4) {
      if (formData.services.length === 0) {
        errors.services = 'Please select at least one service';
      } else {
        // Validate each service
        for (let i = 0; i < formData.services.length; i++) {
          const service = formData.services[i];
          if (!service.avg_consultation_time_minutes || service.avg_consultation_time_minutes <= 0) {
            errors[`services_${i}_time`] = 'Consultation time must be greater than 0';
          }
          if (!service.default_max_tokens_per_day || service.default_max_tokens_per_day <= 0) {
            errors[`services_${i}_tokens`] = 'Max tokens must be greater than 0';
          }
        }
      }
    }
    
    setStepErrors(prev => ({ ...prev, [step]: errors }));
    return Object.keys(errors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      setError('Please fix all validation errors');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        hospital: {
          name: formData.hospital_name.trim(),
          registration_number: formData.registration_number.trim(),
          hospital_type: formData.hospital_type,
          established_year: formData.established_year ? parseInt(formData.established_year) : null,
          email: formData.official_email.trim(),
          phone_number: formData.phone_number.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        },
        admin: {
          name: formData.admin_name.trim(),
          email: formData.admin_email.trim(),
          password: formData.password,
          staff_id: formData.staff_id.trim(),
          staff_password: formData.staff_password
        },
        services: formData.services
      };

      const response = await fetch(`${API_BASE_URL}/auth/register-hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different types of errors
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Handle validation errors array
            const errorMessages = data.detail.map(err => err.msg || err.message).join(', ');
            setError(errorMessages);
          } else {
            // Handle single error message
            setError(data.detail);
          }
        } else {
          setError('Registration failed');
        }
        return;
      }

      // Registration successful - do NOT auto-login
      // Show success message and redirect to staff login
      setShowSuccess(true);
      
      // Navigate to staff login after 2 seconds
      setTimeout(() => {
        navigate('/staff-login');
      }, 2000);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Progress calculation
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header with Back Navigation */}
      <Header 
        showNavigation={false} 
        showActions={false}
        customActions={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="rounded-lg bg-white/20 hover:bg-white/25 backdrop-blur-sm border border-white/20 px-4 py-2 text-white font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </motion.button>
        }
      />

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Registration successful. Please login using your Staff ID.</span>
          </div>
        </motion.div>
      )}

      {/* Main Registration Card */}
      <div className="flex items-center justify-center min-h-screen pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Hospital Registration</h1>
                <p className="text-blue-100 text-sm">Register your hospital with TREFIX</p>
              </motion.div>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep >= step.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      whileHover={{ scale: currentStep >= step.id ? 1.1 : 1 }}
                    >
                      {step.id}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div className={`w-full h-1 mx-2 transition-colors ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Hospital Identity */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hospital Identity</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
                        <input
                          type="text"
                          name="hospital_name"
                          value={formData.hospital_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[1].hospital_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter hospital name"
                        />
                        {stepErrors[1].hospital_name && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[1].hospital_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                        <input
                          type="text"
                          name="registration_number"
                          value={formData.registration_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[1].registration_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter registration number"
                        />
                        {stepErrors[1].registration_number && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[1].registration_number}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type *</label>
                        <select
                          name="hospital_type"
                          value={formData.hospital_type}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[1].hospital_type ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select hospital type</option>
                          <option value="private">Private</option>
                          <option value="government">Government</option>
                          <option value="trust">Trust</option>
                        </select>
                        {stepErrors[1].hospital_type && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[1].hospital_type}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                        <input
                          type="number"
                          name="established_year"
                          value={formData.established_year}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 1990"
                          min="1800"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact & Location */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact & Location</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Official Email *</label>
                        <input
                          type="email"
                          name="official_email"
                          value={formData.official_email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[2].official_email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="hospital@example.com"
                        />
                        {stepErrors[2].official_email && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[2].official_email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[2].phone_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="9876543210"
                        />
                        {stepErrors[2].phone_number && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[2].phone_number}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[2].address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter complete address"
                        />
                        {stepErrors[2].address && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[2].address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[2].city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="City"
                          />
                          {stepErrors[2].city && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[2].city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[2].state ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="State"
                          />
                          {stepErrors[2].state && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[2].state}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[2].pincode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="110001"
                          />
                          {stepErrors[2].pincode && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[2].pincode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Admin Account */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Account</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                        <input
                          type="text"
                          name="admin_name"
                          value={formData.admin_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[3].admin_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter administrator name"
                        />
                        {stepErrors[3].admin_name && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[3].admin_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
                        <input
                          type="email"
                          name="admin_email"
                          value={formData.admin_email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[3].admin_email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="admin@example.com"
                        />
                        {stepErrors[3].admin_email && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[3].admin_email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[3].password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter password"
                        />
                        {stepErrors[3].password && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[3].password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                        <input
                          type="password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            stepErrors[3].confirm_password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm password"
                        />
                        {stepErrors[3].confirm_password && (
                          <p className="text-red-500 text-sm mt-1">{stepErrors[3].confirm_password}</p>
                        )}
                      </div>

                      {/* Staff Login Credentials */}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Staff Login Credentials</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                          <input
                            type="text"
                            name="staff_id"
                            value={formData.staff_id}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[3].staff_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter staff ID"
                          />
                          {stepErrors[3].staff_id && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[3].staff_id}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Password *</label>
                          <input
                            type="password"
                            name="staff_password"
                            value={formData.staff_password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[3].staff_password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter staff password"
                          />
                          {stepErrors[3].staff_password && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[3].staff_password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Staff Password *</label>
                          <input
                            type="password"
                            name="confirm_staff_password"
                            value={formData.confirm_staff_password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              stepErrors[3].confirm_staff_password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm staff password"
                          />
                          {stepErrors[3].confirm_staff_password && (
                            <p className="text-red-500 text-sm mt-1">{stepErrors[3].confirm_staff_password}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Services & Capacity */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Services & Capacity</h3>
                      
                      {stepErrors[4].services && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          <p className="text-sm">{stepErrors[4].services}</p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {availableServices.map((service) => {
                          const isSelected = formData.services.some(s => s.service_id === service.id);
                          const selectedService = formData.services.find(s => s.service_id === service.id);
                          
                          return (
                            <motion.div
                              key={service.id}
                              whileHover={{ scale: 1.01 }}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                if (isSelected) {
                                  // Remove service
                                  setFormData(prev => ({
                                    ...prev,
                                    services: prev.services.filter(s => s.service_id !== service.id)
                                  }));
                                } else {
                                  // Add service with default values
                                  setFormData(prev => ({
                                    ...prev,
                                    services: [...prev.services, {
                                      service_id: service.id,
                                      avg_consultation_time_minutes: 15,
                                      default_max_tokens_per_day: 50
                                    }]
                                  }));
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <div>
                                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                                    <p className="text-sm text-gray-500">Configure consultation settings</p>
                                  </div>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Avg Consultation Time (minutes)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={selectedService.avg_consultation_time_minutes}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        const newTime = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({
                                          ...prev,
                                          services: prev.services.map(s =>
                                            s.service_id === service.id
                                              ? { ...s, avg_consultation_time_minutes: newTime }
                                              : s
                                          )
                                        }));
                                      }}
                                      onClick={(e) => e.stopPropagation()} // Prevent card click
                                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_time`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                    />
                                    {stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_time`] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_time`]}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Max Tokens Per Day
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={selectedService.default_max_tokens_per_day}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        const newTokens = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({
                                          ...prev,
                                          services: prev.services.map(s =>
                                            s.service_id === service.id
                                              ? { ...s, default_max_tokens_per_day: newTokens }
                                              : s
                                          )
                                        }));
                                      }}
                                      onClick={(e) => e.stopPropagation()} // Prevent card click
                                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_tokens`] ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                    />
                                    {stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_tokens`] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {stepErrors[4][`services_${formData.services.findIndex(s => s.service_id === service.id)}_tokens`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
                >
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
                  whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
                >
                  Previous
                </motion.button>

                {currentStep < steps.length ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Registering...
                      </>
                    ) : (
                      'Register Hospital'
                    )}
                  </motion.button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/staff-login')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HospitalRegistration;
