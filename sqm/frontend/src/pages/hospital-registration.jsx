import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Simplified Header Component for Registration Page
const RegistrationHeader = () => {
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92%] md:w-[80%]
      flex items-center justify-between px-6 py-3
      backdrop-blur-[10px] bg-[#00000000]
      border border-blue-600/20
      rounded-full z-50 transition-all duration-300 poppins"
    >
      <div className="flex w-full items-center justify-between px-6">
        {/* Back to Home Button */}
        <motion.button
          onClick={() => navigate('/')}
          className="group relative p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg 
            className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
        </motion.button>

        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-blue-700">
            Hospital Registration
          </h1>
        </div>

        {/* Empty space for balance */}
        <div className="w-9"></div>
      </div>
    </header>
  );
};

const HospitalRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Information (matching database structure)
    name: '',
    state: 'Andhra Pradesh', // Default state
    district: '',
    mandal: '',
    area: '',
    landmark: '',
    street: '',
    city: '',
    pincode: '',
    specialities: [], // Array of specialities
    source: 'NTR_VAIDYA_SEVA', // Fixed source for government hospitals
    mitraContactNo: '', // Mitra contact number for verification
    
    // Staff Login Information
    staffId: '', // Staff ID for login
    password: '', // Password for staff login
    
    // Additional fields for extended functionality
    phone: '',
    beds: 50,
    emergencyServices: true,
    ambulanceServices: false,
    
    // Admin Information
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPosition: '',
    
    // Verification
    registrationVerified: false,
    licenseVerified: false,
    verificationDocuments: {
      registration: null,
      license: null
    },
    
    // Agreement
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const specialityOptions = [
    'General Medicine', 'Maternity', 'Pediatrics', 'Surgery', 
    'Orthopedics', 'Cardiology', 'Emergency', 'Obstetrics & Gynecology',
    'Neonatology', 'Ophthalmology', 'ENT', 'Dermatology',
    'Psychiatry', 'Radiology', 'Pathology', 'Anesthesiology'
  ];

  const districtOptions = [
    'Ananthapur', 'Anakapalli', 'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari',
    'Eluru', 'Guntur', 'Kakinada', 'Kurnool', 'Kadapa', 'Krishna', 'NTR', 'Nellore', 'Palnadu',
    'Parvathipuram Manyam', 'Prakasam', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR'
  ];

  const mandalOptions = {
    'Ananthapur': ['Ananthapur', 'Atmakur', 'Bukkapatnam', 'Kalyandurg', 'Peddavadugur', 'Raptadu', 'Uravakonda'],
    'Anakapalli': ['Anakapalli', 'Narsipatnam', 'Chodavaram', 'Yelamanchili', 'Pendurthi', 'S. Rayavaram'],
    'Bapatla': ['Bapatla', 'Ponnur', 'Repalle', 'Chirala', 'Karempudi', 'Nagaram'],
    'Chittoor': ['Chittoor', 'Tirupati', 'Puttur', 'Nagari', 'Srikalahasti', 'Palamaner', 'Madanapalle'],
    'Dr. B.R. Ambedkar Konaseema': ['Amalapuram', 'Mummidivaram', 'Mamidikuduru', 'Razole', 'Mummidivaram', 'Kothapeta'],
    'East Godavari': ['RAJAHMUNDRY - U', 'ANAPARTHI - R', 'Gokavaram - R', 'Gopalapuram - R', 'Kadiam - R', 'Kovvur - U', 'Nidadavole - U', 'Rajanagaram - R'],
    'Eluru': ['Eluru', 'Bhimavaram', 'Tadepalligudem', 'Jangareddigudem', 'Kovvur', 'Nidadavole'],
    'Guntur': ['Guntur', 'Tenali', 'Mangalagiri', 'Sattenapalle', 'Narsaraopet', 'Ponnur', 'Bapatla'],
    'Kakinada': ['Kakinada - U', 'Peddapuram - U', 'Pithapuram - U', 'SAMALKOT - R', 'Tuni - U', 'Jaggampeta - R', 'Pedapudi - R', 'Pithapuram - R', 'Prathipadu - R', 'Rowthulapudi - R', 'TALLAREVU - R', 'Yeleswaram - U'],
    'Kurnool': ['Kurnool', 'Nandyal', 'Adoni', 'Bethamcherla', 'Dhone', 'Yemmiganur', 'Nandikotkur'],
    'Kadapa': ['Kadapa', 'Proddatur', 'Jammalamadugu', 'Badvel', 'Pulivendula', 'Rajampeta', 'Kamalapuram'],
    'Krishna': ['Vijayawada', 'Machilipatnam', 'Gudivada', 'Nuzvid', 'Tiruvuru', 'Vuyyuru', 'Nandigama'],
    'NTR': ['Tiruvuru', 'Vuyyuru', 'Nandigama', 'Mylavaram', 'Gannavaram', 'Ibrahimpatnam', 'Kanchikacherla'],
    'Nellore': ['Nellore', 'Kavali', 'Gudur', 'Venkatagiri', 'Udayagiri', 'Kovur', 'Sullurpeta'],
    'Palnadu': ['Narasaraopet', 'Sattenapalle', 'Vinukonda', 'Macherla', 'Piduguralla', 'Dachepalli'],
    'Parvathipuram Manyam': ['Parvathipuram', 'Salur', 'Bobbili', 'S Kota', 'Garividi', 'Komarada'],
    'Prakasam': ['Ongole', 'Markapur', 'Chirala', 'Kandukur', 'Yerragondapalem', 'Kanigiri', 'Giddalur'],
    'Sri Sathya Sai': ['Puttaparthi', 'Dharmavaram', 'Kadiri', 'Hindupur', 'Madanapalle', 'Penukonda'],
    'Srikakulam': ['Srikakulam', 'Palakonda', 'Rajam', 'Ichchapuram', 'Tekkali', 'Amadalavalasa', 'Etcherla'],
    'Tirupati': ['Tirupati', 'Srikalahasti', 'Puttur', 'Nagari', 'Renigunta', 'Chandragiri', 'Tiruchanur'],
    'Visakhapatnam': ['Visakhapatnam', 'Anakapalle', 'Bheemunipatnam', 'Narsipatnam', 'Chodavaram', 'Vepagunta'],
    'Vizianagaram': ['Vizianagaram', 'Bobbili', 'Salur', 'Parvathipuram', 'S Kota', 'Gajapathinagaram'],
    'West Godavari': ['Eluru', 'Bhimavaram', 'Tadepalligudem', 'Jangareddigudem', 'Kovvur', 'Nidadavole', 'Undi'],
    'YSR': ['Kadapa', 'Proddatur', 'Jammalamadugu', 'Badvel', 'Pulivendula', 'Rajampeta', 'Rayachoti']
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSpecialityChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        specialities: [...prev.specialities, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        specialities: prev.specialities.filter(spec => spec !== value)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Hospital name is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.mandal) newErrors.mandal = 'Mandal is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.street.trim()) newErrors.street = 'Street is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    if (!formData.mitraContactNo.trim()) newErrors.mitraContactNo = 'Mitra contact number is required';
    else if (!/^\d{10}$/.test(formData.mitraContactNo)) newErrors.mitraContactNo = 'Mitra contact number must be 10 digits';
    if (!formData.staffId.trim()) newErrors.staffId = 'Staff ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.specialities.length === 0) newErrors.specialities = 'At least one speciality is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = 'Invalid email format';
    if (!formData.adminPhone.trim()) newErrors.adminPhone = 'Admin phone is required';
    else if (!/^\d{10}$/.test(formData.adminPhone)) newErrors.adminPhone = 'Admin phone must be 10 digits';
    if (!formData.adminPosition.trim()) newErrors.adminPosition = 'Admin position is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for backend API
      const fullAddress = `${formData.street}, ${formData.area}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}`;
      
      const hospitalData = {
        name: formData.name,
        address: fullAddress,
        city: formData.city, // Use separate city field
        state: formData.state,
        district: formData.district,
        mandal: formData.mandal,
        pincode: formData.pincode,
        phone: formData.phone,
        beds: parseInt(formData.beds),
        emergencyServices: formData.emergencyServices,
        ambulanceServices: formData.ambulanceServices,
        specialities: formData.specialities || [],
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPosition: formData.adminPosition,
        // New verification fields
        mitraContactNo: formData.mitraContactNo,
        staffId: formData.staffId,
        password: formData.password
      };

      // Send to backend API
      const response = await fetch('http://localhost:8000/hospital/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hospitalData),
      });

      const result = await response.json();

      if (result.success) {
        // Store additional data locally
        const registrationData = {
          ...formData,
          registrationId: result.hospitalId || `HOSP_${Date.now()}`,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          backendResponse: result
        };
        
        localStorage.setItem('hospitalRegistration', JSON.stringify(registrationData));
        
        setLoading(false);
        setSuccess(true);
        
        // Reset form after 3 seconds and redirect to staff login
        setTimeout(() => {
          setSuccess(false);
          navigate('/staff-login');
        }, 3000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    }
  };

  if (success) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your hospital registration has been submitted successfully. We will review your details and contact you within 24-48 hours.
          </p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <RegistrationHeader />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Register Your Hospital</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join SmartQueue to reach more patients and manage queues efficiently. 
              Fill in the details below to get started.
            </p>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Primary Health Centre Ananthapur"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select District</option>
                  {districtOptions.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-xs text-red-600">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mandal *
                </label>
                <select
                  name="mandal"
                  value={formData.mandal}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.mandal ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.district ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Mandal</option>
                  {formData.district && mandalOptions[formData.district]?.map(mandal => (
                    <option key={mandal} value={mandal}>{mandal}</option>
                  ))}
                </select>
                {errors.mandal && (
                  <p className="mt-1 text-xs text-red-600">{errors.mandal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 515001"
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Information *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Street *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 123 Main Road"
                  />
                  {errors.street && (
                    <p className="mt-1 text-xs text-red-600">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Area *
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.area ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Gandhi Nagar"
                  />
                  {errors.area && (
                    <p className="mt-1 text-xs text-red-600">{errors.area}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="e.g., Near Bus Stand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Ananthapur"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mitra Contact Number *
              </label>
              <input
                type="tel"
                name="mitraContactNo"
                value={formData.mitraContactNo}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mitraContactNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 9281068545"
                maxLength={10}
              />
              {errors.mitraContactNo && (
                <p className="mt-1 text-xs text-red-600">{errors.mitraContactNo}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialities *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialityOptions.map(speciality => (
                  <label key={speciality} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="specialities"
                      value={speciality}
                      checked={formData.specialities.includes(speciality)}
                      onChange={handleSpecialityChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{speciality}</span>
                  </label>
                ))}
              </div>
              {errors.specialities && (
                <p className="mt-1 text-xs text-red-600">{errors.specialities}</p>
              )}
            </div>
          </motion.div>

          {/* Staff Login Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Staff Login Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff ID *
                </label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.staffId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., STAFF_001"
                />
                {errors.staffId && (
                  <p className="mt-1 text-xs text-red-600">{errors.staffId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> These credentials will be used for staff login to access hospital dashboard.
              </p>
            </div>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., +919876543210"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Beds *
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.beds ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 100"
                />
                {errors.beds && (
                  <p className="mt-1 text-xs text-red-600">{errors.beds}</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="emergencyServices"
                  checked={formData.emergencyServices}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">24/7 Emergency Services</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="ambulanceServices"
                  checked={formData.ambulanceServices}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ambulance Services</span>
              </label>
            </div>
          </motion.div>

          {/* Admin Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.adminName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter admin name"
                />
                {errors.adminName && (
                  <p className="mt-1 text-xs text-red-600">{errors.adminName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Position *
                </label>
                <input
                  type="text"
                  name="adminPosition"
                  value={formData.adminPosition}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.adminPosition ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Hospital Administrator"
                />
                {errors.adminPosition && (
                  <p className="mt-1 text-xs text-red-600">{errors.adminPosition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.adminEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="admin@hospital.com"
                />
                {errors.adminEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Phone *
                </label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.adminPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., +919876543210"
                />
                {errors.adminPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.adminPhone}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Terms and Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions and certify that all information provided is accurate and complete. 
                  I understand that false information may result in rejection of this registration.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="mt-1 text-xs text-red-600">{errors.termsAccepted}</p>
              )}
            </div>

            {/* Submit Error Display */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.termsAccepted}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Submitting...' : 'Register Hospital'}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </section>
    </>
  );
};

export default HospitalRegistration;
