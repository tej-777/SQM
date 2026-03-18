import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = ({ showNavigation = true, showActions = true, customActions = null }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[92%] sm:w-[80%]
      flex items-center justify-between px-4 sm:px-6 py-3
      backdrop-blur-[10px] bg-[#00000000]
      border border-blue-600/20
      rounded-full z-50 transition-all duration-300 poppins"
    >
      <div className="flex w-full items-center justify-between">

        {/* Brand */}
        <div className="leading-tight">
          <h1 className="text-lg sm:text-xl font-bold text-blue-700">
            SmartQueue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Hospital Queue System
          </p>
        </div>

        {/* Navigation Links - Desktop */}
        {showNavigation && (
          <nav className="hidden md:flex items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-gray-600">
            <a href="#Home" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="#How-It-Works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#What-Is-This-For" className="hover:text-blue-600 transition-colors">
              Who is this for?
            </a>
            <a href="#Footer" className="hover:text-blue-600 transition-colors">
              About
            </a>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {showNavigation && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Actions - Desktop */}
        {customActions ? (
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {customActions}
          </div>
        ) : showActions && (
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/staff-login')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Staff Login
            </button>
            <button
              onClick={() => navigate('/medical-problem')}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Join Queue
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && showNavigation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm font-medium text-gray-600">
            <a href="#Home" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="#How-It-Works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#What-Is-This-For" className="hover:text-blue-600 transition-colors">
              Who is this for?
            </a>
            <a href="#Footer" className="hover:text-blue-600 transition-colors">
              About
            </a>
          </nav>
          {showActions && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/staff-login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm text-center"
              >
                Staff Login
              </button>
              <button
                onClick={() => navigate('/medical-problem')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm text-center"
              >
                Join Queue
              </button>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
};

export default Header;
