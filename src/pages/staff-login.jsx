import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const StaffLogin = () => {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check if token already exists and redirect to dashboard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      navigate('/staff-dashboard');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({
        staff_id: staffId,
        password: password,
      });

      console.log("Full login response:", response);

      // Check if response has access_token
      if (response.access_token) {
        // Save token and user data to localStorage for persistence
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("staff_user", JSON.stringify(response.user || response));
        
        // Debug: Confirm token is saved
        console.log("Token saved to localStorage:", localStorage.getItem("token"));
        console.log("User data saved:", localStorage.getItem("staff_user"));
        
        // Update AuthContext
        login(response.access_token);
        
        navigate("/staff-dashboard");
      } else {
        console.error("No access_token in response:", response);
        setError("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header with back navigation button */}
      <Header 
        showNavigation={false} 
        showActions={false}
        customActions={
          <motion.button
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        }
      />
      
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Login</h1>
            <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                Staff ID
              </label>
              <input
                type="text"
                id="staffId"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your staff ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Contact your administrator if you need login credentials
            </p>
          </div>
        </div>
      </motion.div>
    </section>
    </>
  );
};

export default StaffLogin;
