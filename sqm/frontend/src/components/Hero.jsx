import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import hospitalQueue from '../assets/hospital-queue.png';
import MedicalBackground from './med_bg';



const Hero = () => {
  const navigate = useNavigate();

  const handleJoinQueue = () => {
    navigate('/medical-problem');
  };

  return (
    <section id = "Home">
    <motion.section 
      className="relative  overflow-hidden min-h-screen w-full flex items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Medical Background Decorations */}
      

      
      <div className="relative w-full ml-40 mr-30 flex items-center z-10 justify-between h-full">
        {/* Left side - Content */}
        <div className="flex-1 text-left">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              🏥 Smart Hospital Queue Management
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Skip hospital queues.
            <br />
            <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Wait smart.</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join queues remotely from your phone and get live updates on your wait time. 
            No more crowded waiting rooms or uncertainty about when you'll be seen.
          </motion.p>
          
          <motion.div 
            className="flex gap-6 mb-10 mt-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={handleJoinQueue}
              className=" px-5 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Join a Queue
            </button>
            
            <button
              onClick={() => navigate('/hospital-registration')}
              className="px-5 py-2 bg-white text-blue-600 font-bold text-sm rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Hospital Registration
            </button>
          </motion.div>
          
          <motion.div 
            className="flex justify-start space-x-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">No waiting room</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Real-time updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Easy to use</span>
            </div>
          </motion.div>
        </div>
        
        {/* Right side - Image */}
        <motion.div 
          className="flex-1 flex justify-center items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <div className="relative">
              <img 
                src={hospitalQueue} 
                alt="Hospital Queue Management System" 
                className="w-full max-w-max h-auto object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
    </section>
  );
};

export default Hero;
