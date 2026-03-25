import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MedicalProblem = () => {
  const navigate = useNavigate();
  const [selectedProblem, setSelectedProblem] = useState('');
  const [customProblem, setCustomProblem] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [activeTab, setActiveTab] = useState('specialists'); // 'specialists' or 'problems'
  const [error, setError] = useState('');

  // Common medical problems/diseases (excluding those covered by specialists)
  const commonProblems = [
    'Fever',
    'Cough & Cold',
    'Headache',
    'Stomach Pain',
    'Allergies',
    'Diabetes Checkup',
    'Blood Pressure Check',
    'Mental Health',
    'Injury/Accident',
    'Women Health',
    'Child Health',
    'General Checkup',
    'Vaccination',
    'Throat Pain',
    'Body Pain',
    'Fatigue',
    'Nausea',
    'Dizziness',
    'Sleep Problems',
    'Weight Management'
  ];

  // Medical specialists and their areas
  const medicalSpecialists = [
    { name: 'Cardiologist', area: 'Heart', keywords: ['heart', 'cardiac', 'chest pain', 'palpitations'] },
    { name: 'Pulmonologist', area: 'Lungs', keywords: ['lungs', 'breathing', 'asthma', 'cough'] },
    { name: 'Neurologist', area: 'Brain & Nerves', keywords: ['brain', 'nerves', 'headache', 'seizures'] },
    { name: 'Orthopedic', area: 'Bones & Joints', keywords: ['bones', 'joints', 'fracture', 'arthritis'] },
    { name: 'Dermatologist', area: 'Skin', keywords: ['skin', 'rash', 'acne', 'eczema'] },
    { name: 'Ophthalmologist', area: 'Eyes', keywords: ['eyes', 'vision', 'cataract', 'glaucoma'] },
    { name: 'ENT Specialist', area: 'Ears, Nose, Throat', keywords: ['ear', 'nose', 'throat', 'sinus'] },
    { name: 'Gastroenterologist', area: 'Digestive System', keywords: ['stomach', 'digestion', 'liver', 'intestine'] },
    { name: 'Endocrinologist', area: 'Hormones & Glands', keywords: ['diabetes', 'thyroid', 'hormones'] },
    { name: 'Nephrologist', area: 'Kidneys', keywords: ['kidney', 'urine', 'dialysis'] },
    { name: 'Psychiatrist', area: 'Mental Health', keywords: ['mental', 'depression', 'anxiety', 'psychiatric'] },
    { name: 'Gynecologist', area: 'Women Health', keywords: ['women', 'pregnancy', 'menstrual'] },
    { name: 'Pediatrician', area: 'Children', keywords: ['child', 'baby', 'pediatric'] },
    { name: 'Oncologist', area: 'Cancer', keywords: ['cancer', 'tumor', 'chemotherapy'] },
    { name: 'Urologist', area: 'Urinary System', keywords: ['urinary', 'bladder', 'prostate'] },
    { name: 'Rheumatologist', area: 'Autoimmune & Joints', keywords: ['arthritis', 'autoimmune', 'rheumatism'] },
    { name: 'General Physician', area: 'General Health', keywords: ['general', 'checkup', 'primary'] },
    { name: 'Dentist', area: 'Dental', keywords: ['dental', 'teeth', 'gums'] }
  ];

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setIsOtherSelected(false);
    setCustomProblem('');
    setError('');
  };

  const handleOtherSelect = () => {
    setIsOtherSelected(true);
    setSelectedProblem('');
    setError('');
  };

  const handleSpecialistSelect = (specialist) => {
    setSelectedSpecialist(specialist.name);
    setSelectedProblem(`Visit ${specialist.name} - ${specialist.area}`);
    setIsOtherSelected(false);
    setCustomProblem('');
    setError('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
    }

    // Navigate to patient dashboard with the medical problem
    navigate('/patient-dashboard', { state: { medicalProblem: problem.trim() } });
  };

  const handleSubmit = () => {
    const problem = isOtherSelected ? customProblem : selectedProblem;
    
    if (!problem || problem.trim() === '') {
      setError('Please select or enter your medical problem');
      return;
    }

    // Navigate to patient dashboard with the medical problem
    navigate('/patient-dashboard', { state: { medicalProblem: problem.trim() } });
  };

  const handleBack = () => {
    navigate('/');
  };

  // Filter specialists based on search query
  const filteredSpecialists = medicalSpecialists.filter(specialist => 
    specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialist.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialist.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter common problems based on search query
  const filteredProblems = commonProblems.filter(problem =>
    problem.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-gray-50 pt-20 sm:pt-20">
      {/* Header */}
      <header
        className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92%] md:w-[80%]
        flex items-center justify-between px-6 py-3
        backdrop-blur-[10px] bg-transparent
        border border-blue-600/20
        rounded-full z-50 transition-all duration-300"
      >
        <div className="flex w-full items-center justify-between px-6">
          {/* Brand */}
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

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Patient Dashboard Button */}
            <motion.button
              onClick={() => navigate('/patient-dashboard')}
              className="group relative p-2 rounded-full bg-white shadow-md hover:shadow-md transition-all duration-300 border border-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Patient Dashboard
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </motion.button>

            {/* Back Button */}
            <motion.button
              onClick={handleBack}
              className="group relative p-2 rounded-full bg-white shadow-md hover:shadow-md transition-all duration-300 border border-gray-200"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Back to Home
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What brings you to the hospital today?
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Search by disease, condition, or specialist doctor
          </p>
        </motion.div>

        {/* Single Card with All Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search diseases, symptoms, or specialists..."
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
              <div className="absolute right-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <motion.button
              onClick={handleSearch}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('specialists')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'specialists'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse by Specialist
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'problems'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Common Problems
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-75">
            {activeTab === 'specialists' ? (
              <motion.div
                key="specialists"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {(searchQuery ? filteredSpecialists : medicalSpecialists).map((specialist, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSpecialistSelect(specialist)}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                        selectedSpecialist === specialist.name
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-sm mb-1">{specialist.name}</div>
                      <div className="text-xs text-gray-500">{specialist.area}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="problems"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {(searchQuery ? filteredProblems : commonProblems).map((problem, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleProblemSelect(problem)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedProblem === problem && !isOtherSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {problem}
                    </motion.button>
                  ))}
                  
                  {/* Other Option */}
                  <motion.button
                    onClick={handleOtherSelect}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      isOtherSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Other
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Custom Problem Input */}
          {isOtherSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe your medical problem
              </label>
              <textarea
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="Describe your symptoms or medical condition..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                rows={3}
              />
            </motion.div>
          )}

          {/* Selected Problem Display */}
          {(selectedProblem || customProblem) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected Problem:</span> {isOtherSelected ? customProblem : selectedProblem}
              </p>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <motion.button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedProblem && !customProblem}
            >
              Continue to Hospital Search
            </motion.button>
          </div>
        </motion.div>

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">
                <span className="font-medium">Emergency:</span> If you have a life-threatening emergency, please call emergency services immediately or go to the nearest hospital.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </section>
  );
};

export default MedicalProblem;
