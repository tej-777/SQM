import React from 'react';
import { motion } from 'framer-motion';
import hospital from "../assets/hospital.png";
import patient from "../assets/patient.png";


const Audience = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="What-Is-This-For">
    <motion.section
      className="relative py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Medical Background Decorations */}
        
      
      <div className="max-w-7xl mx-4 md:mx-35">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-6">
            Who Is This For
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Designed for 
            <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Everyone</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a patient waiting for care or a hospital managing patient flow
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white p-6 md:p-10 z-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-xl transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-5">
                <img src={patient} alt="Patient" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">For Patients</h3>
                <p className="text-gray-500 mt-1">Better healthcare experience</p>
              </div>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Skip long waiting room queues</span>
                  <p className="text-gray-600 mt-1">Wait comfortably from home instead of crowded waiting areas</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Real-time queue updates</span>
                  <p className="text-gray-600 mt-1">Get live updates on your position and estimated wait time</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Reduce stress and anxiety</span>
                  <p className="text-gray-600 mt-1">Enjoy predictable wait times and better planning</p>
                </div>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 md:p-10 rounded-3xl z-10 shadow-xl border border-gray-100 hover:shadow-xl transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-5">
                <img src={hospital} alt="Hospital" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">For Hospitals</h3>
                <p className="text-gray-500 mt-1">Streamlined operations</p>
              </div>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Reduce overcrowding</span>
                  <p className="text-gray-600 mt-1">Improve patient flow and manage waiting areas effectively</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Enhance patient satisfaction</span>
                  <p className="text-gray-600 mt-1">Modern digital experience that patients expect and love</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">Real-time analytics</span>
                  <p className="text-gray-600 mt-1">Streamline operations with queue management insights</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
    </section>
  );
};

export default Audience;
