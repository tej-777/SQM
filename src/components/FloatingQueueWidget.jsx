import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingQueueWidget = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check for active queue in localStorage
    const activeQueue = localStorage.getItem("active_queue");
    console.log("🔍 FloatingWidget: Checking active_queue:", activeQueue);
    
    if (activeQueue) {
      try {
        const parsed = JSON.parse(activeQueue);
        console.log("🔍 FloatingWidget: Parsed queue data:", parsed);
        setQueueData(parsed);
        
        // Auto-hide if status is completed or called
        if (parsed.status === "completed" || parsed.status === "called") {
          console.log("🔍 FloatingWidget: Status is completed/called, removing widget");
          localStorage.removeItem("active_queue");
          setQueueData(null);
          setIsVisible(false);
          
          // Show toast notification
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Your queue session has been completed!', 'success');
          }
        } else {
          console.log("🔍 FloatingWidget: Status is active, showing widget");
          setIsVisible(true);
        }
        
        // TEMP DEBUG: Force show for testing
        setIsVisible(true);
      } catch (error) {
        console.error('Error parsing active_queue:', error);
      }
    } else {
      console.log("🔍 FloatingWidget: No active_queue found, widget not showing");
    }
  }, []);

  const handleWidgetClick = (e) => {
    // Prevent navigation if X button is clicked
    if (e.target.closest('.dismiss-btn')) return;
    navigate('/queue-status', { 
      state: { 
        appointmentId: queueData.appointmentId,
        tokenNumber: queueData.token,
        patientName: queueData.patientName,
        hospital: queueData.hospital,
        service: queueData.service
      } 
    });
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  if (!isVisible || !queueData) {
    return null;
  }

  const isWaiting = queueData.status === "waiting" || queueData.status === "Waiting";
  const token = queueData.token || "T-0";

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.02 }}
          className="fixed bottom-4 right-4 z-50 cursor-pointer"
          onClick={handleWidgetClick}
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div 
            className="rounded-2xl p-4 min-w-[320px]"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
            }}
          >
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-xs text-gray-400 font-medium">Queue Status</span>
              </div>
              
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10 dismiss-btn"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Token Number */}
            <div className="text-center mb-3">
              <div className={`text-2xl font-bold ${isWaiting ? 'text-green-400' : 'text-blue-400'}`}>
                {token}
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="space-y-1">
              <div className="text-sm text-white font-medium">
                {queueData.patientName || queueData.name || 'Patient'}
              </div>
              <div className="text-xs text-gray-400">
                {queueData.hospital} • {queueData.service}
              </div>
              
              {/* Status with pulsing dot */}
              <div className="flex items-center gap-2 mt-2">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${
                    queueData.status === "completed" || queueData.status === "COMPLETED" ? 'bg-gray-500' :
                    queueData.status === "called" || queueData.status === "CALLED" ? 'bg-orange-500' :
                    'bg-green-500'
                  }`} />
                  {(isWaiting || queueData.status === "waiting" || queueData.status === "WAITING") && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 w-2 h-2 rounded-full bg-green-500"
                    />
                  )}
                </div>
                <div className="text-xs font-medium capitalize" style={{
                  color: queueData.status === "completed" || queueData.status === "COMPLETED" ? '#9CA3AF' :
                         queueData.status === "called" || queueData.status === "CALLED" ? '#FB923C' :
                         '#10B981'
                }}>
                  {queueData.status}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        // Minimized version
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.button
            onClick={handleRestore}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-2xl p-3 shadow-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {(isWaiting || queueData.status === "waiting" || queueData.status === "WAITING") && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingQueueWidget;
