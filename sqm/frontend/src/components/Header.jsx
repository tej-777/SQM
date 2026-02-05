import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = () => {
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

        {/* Brand */}
        <div className="leading-tight">
          <h1 className="text-xl font-bold text-blue-700">
            SmartQueue
          </h1>
          <p className="text-xs text-gray-500">
            Hospital Queue System
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/medical-problem')}
            className="hidden sm:inline-flex rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Join Queue
          </motion.button>

          <motion.button
            onClick={() => navigate('/staff-login')}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Staff Login
          </motion.button>
        </div>

      </div>
    </header>
  );
};

export default Header;
