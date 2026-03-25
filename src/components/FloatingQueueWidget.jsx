import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingQueueWidget = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate estimated wait time in MM:SS format like queue status page
  const [etaSeconds, setEtaSeconds] = useState(0);
  const constraintsRef = useRef(null);

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

  // Convert minutes to seconds when data is received
  useEffect(() => {
    if (queueData?.estimatedWaitMinutes !== undefined) {
      setEtaSeconds(queueData.estimatedWaitMinutes * 60);
    }
  }, [queueData]);
  
  // Create countdown timer
  useEffect(() => {
    if (etaSeconds <= 0) return;

    const interval = setInterval(() => {
      setEtaSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [etaSeconds]);

  const handleWidgetClick = (e) => {
    // Prevent navigation if dragging or X button is clicked
    if (isDragging || e.target.closest('.dismiss-btn')) return;
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

  // Early return ONLY after all hooks
  if (!isVisible || !queueData) {
    return null;
  }

  const isWaiting = queueData.status === "waiting" || queueData.status === "Waiting";
  const token = queueData.token || "T-0";
  const peopleAhead = queueData.peopleAhead || 0;
  
  // Format time as MM:SS - same as queue-status page
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format wait from minutes directly
  const formatWait = (minutes) => {
    if (!minutes) return '0:00';
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  const estWaitTime = formatTime(etaSeconds);

  return (
    <>
      {/* Full screen constraint ref */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 9998}} />
      
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.02 }}
            whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
            className="fixed cursor-pointer"
            onClick={handleWidgetClick}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
            style={{
              position: 'fixed',
              bottom: '16px',
              right: '20px',
              zIndex: 9999,
              width: '180px',
              maxWidth: '85vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              cursor: 'grab',
              touchAction: 'none'
            }}
          >
          <div 
            className="rounded-2xl p-3 sm:p-4 w-full"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
            }}
          >
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="text-center mb-2 sm:mb-3">
              <div className={`text-base sm:text-lg font-bold ${isWaiting ? 'text-green-400' : 'text-blue-400'}`}>
                {token}
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-white font-medium truncate">
                {queueData.patientName || queueData.name || 'Patient'}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 truncate">
                {queueData.hospital} • {queueData.service}
              </div>
              
              {/* Estimated Wait Time */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">Est. Wait:</span>
                <span className="text-xs font-bold text-blue-400">
                  {formatWait(queueData?.estimatedWaitMinutes)}
                </span>
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
                <span className="text-xs sm:text-sm font-medium capitalize">
                  {queueData.status === "waiting" || queueData.status === "WAITING" ? "Waiting" :
                   queueData.status === "called" || queueData.status === "CALLED" ? "Called" :
                   queueData.status === "completed" || queueData.status === "COMPLETED" ? "Completed" :
                   queueData.status}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        // Minimized version
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
          className="fixed cursor-pointer"
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '20px',
            zIndex: 9999,
            cursor: 'grab',
            touchAction: 'none'
          }}
        >
          <motion.button
            onClick={handleRestore}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-2xl p-2 sm:p-3 shadow-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {(isWaiting || queueData.status === "waiting" || queueData.status === "WAITING") && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default FloatingQueueWidget;
