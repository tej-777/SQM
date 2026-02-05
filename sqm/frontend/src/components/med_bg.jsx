import React from 'react';

const MedicalBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Medical Cross Symbol */}
        <div className="absolute top-20 left-20 w-32 h-32 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
            <path d="M19 8h-3V5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H5c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h4c1.103 0 2-.897 2-2v-3h3c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2zm-3 6h-3v3h-4v-3H5v-4h3V7h4v3h3v4z"/>
          </svg>
        </div>
        
        {/* Heartbeat/EKG Line */}
        <div className="absolute top-40 right-32 w-64 h-16 opacity-20">
          <svg viewBox="0 0 100 20" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2">
            <path d="M0,10 L20,10 L25,2 L30,18 L35,5 L40,15 L45,10 L65,10 L70,2 L75,18 L80,5 L85,15 L90,10 L100,10" />
          </svg>
        </div>
        
        {/* DNA Helix */}
        <div className="absolute bottom-3 left-80 w-48 h-48 opacity-8">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-green-600">
            <path d="M20,20 Q30,10 40,20 T60,20 T80,20" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,30 Q30,40 40,30 T60,30 T80,30" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,40 Q30,30 40,40 T60,40 T80,40" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,50 Q30,60 40,50 T60,50 T80,50" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,60 Q30,50 40,60 T60,60 T80,60" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,70 Q30,80 40,70 T60,70 T80,70" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20,80 Q30,70 40,80 T60,80 T80,80" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="25" cy="25" r="2" fill="currentColor"/>
            <circle cx="35" cy="35" r="2" fill="currentColor"/>
            <circle cx="45" cy="25" r="2" fill="currentColor"/>
            <circle cx="55" cy="35" r="2" fill="currentColor"/>
            <circle cx="65" cy="25" r="2" fill="currentColor"/>
            <circle cx="75" cy="35" r="2" fill="currentColor"/>
            <circle cx="25" cy="75" r="2" fill="currentColor"/>
            <circle cx="35" cy="65" r="2" fill="currentColor"/>
            <circle cx="45" cy="75" r="2" fill="currentColor"/>
            <circle cx="55" cy="65" r="2" fill="currentColor"/>
            <circle cx="65" cy="75" r="2" fill="currentColor"/>
            <circle cx="75" cy="65" r="2" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Pill/Capsule */}
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 w-24 h-12 opacity-15">
          <svg viewBox="0 0 100 50" fill="currentColor" className="text-purple-600">
            <ellipse cx="50" cy="25" rx="45" ry="20"/>
            <rect x="5" y="5" width="90" height="40" fill="currentColor"/>
            <ellipse cx="50" cy="25" rx="45" ry="20" fill="white"/>
            <rect x="5" y="5" width="45" height="40" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Stethoscope */}
        <div className="absolute bottom-20 right-20 w-40 h-40 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-gray-600">
            <path d="M50,10 C60,10 70,20 70,30 C70,40 60,50 50,50 C40,50 30,40 30,30 C30,20 40,10 50,10 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M35,45 C35,45 35,70 35,80 C35,90 45,95 50,95 C55,95 65,90 65,80 C65,70 65,45 65,45" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="35" cy="85" r="8" fill="currentColor"/>
            <circle cx="65" cy="85" r="8" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Abstract Medical Pattern */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 opacity-8">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-blue-500">
            <rect x="10" y="10" width="20" height="20" rx="2"/>
            <rect x="40" y="10" width="20" height="20" rx="2"/>
            <rect x="70" y="10" width="20" height="20" rx="2"/>
            <rect x="10" y="40" width="20" height="20" rx="2"/>
            <rect x="40" y="40" width="20" height="20" rx="2"/>
            <rect x="70" y="40" width="20" height="20" rx="2"/>
            <rect x="10" y="70" width="20" height="20" rx="2"/>
            <rect x="40" y="70" width="20" height="20" rx="2"/>
            <rect x="70" y="70" width="20" height="20" rx="2"/>
          </svg>
        </div>
        
        {/* Additional Small Medical Elements */}
        {/* Syringe */}
        <div className="absolute top-1/4 left-1/4 w-16 h-8 opacity-12">
          <svg viewBox="0 0 100 50" fill="currentColor" className="text-gray-500">
            <rect x="10" y="20" width="60" height="10" rx="2"/>
            <rect x="70" y="15" width="20" height="20" rx="10"/>
            <path d="M5,25 L10,25" stroke="currentColor" strokeWidth="2"/>
            <circle cx="80" cy="25" r="3" fill="white"/>
          </svg>
        </div>
        
        {/* Medical Clipboard */}
        <div className="absolute top-3/4 right-1/3 w-12 h-16 opacity-10">
          <svg viewBox="0 0 50 80" fill="currentColor" className="text-indigo-600">
            <rect x="5" y="5" width="40" height="70" rx="2"/>
            <rect x="10" y="10" width="30" height="5" fill="white"/>
            <rect x="10" y="20" width="30" height="2" fill="white"/>
            <rect x="10" y="25" width="30" height="2" fill="white"/>
            <rect x="10" y="30" width="30" height="2" fill="white"/>
            <rect x="10" y="35" width="30" height="2" fill="white"/>
          </svg>
        </div>
        
        {/* Medical Thermometer */}
        <div className="absolute bottom-1/4 left-1/3 w-4 h-20 opacity-15">
          <svg viewBox="0 0 20 100" fill="currentColor" className="text-red-600">
            <rect x="8" y="10" width="4" height="70" rx="2"/>
            <circle cx="10" cy="85" r="8"/>
            <rect x="9" y="15" width="2" height="50" fill="white"/>
          </svg>
        </div>
        
        {/* Medical Plus Signs */}
        <div className="absolute top-1/5 right-1/5 w-8 h-8 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-1/5 left-1/5 w-6 h-6 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </div>
        
        <div className="absolute top-2/3 right-2/3 w-10 h-10 opacity-6">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-purple-400">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </div>
        
        {/* Small Medical Icons */}
        <div className="absolute top-1/6 left-2/3 w-8 h-8 opacity-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16Z"/>
          </svg>
        </div>
        
        {/* Additional Medical Elements - Batch 1 */}
        {/* Heart Icon */}
        <div className="absolute top-10 right-10 w-10 h-10 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
          </svg>
        </div>
        
        {/* Medical Bag */}
        <div className="absolute top-1/3 left-10 w-14 h-14 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-teal-600">
            <path d="M10,2V4H16V2H10M5,6V8H19V6H5M5,10V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V10H5Z"/>
          </svg>
        </div>
        
        {/* Blood Drop */}
        <div className="absolute bottom-1/3 right-16 w-6 h-8 opacity-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
            <path d="M12,2C12,2 7,7 7,12C7,14.76 9.24,17 12,17C14.76,17 17,14.76 17,12C17,7 12,2 12,2Z"/>
          </svg>
        </div>
        
        {/* Medical Shield */}
        <div className="absolute top-2/3 left-16 w-12 h-12 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-cyan-600">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.93C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"/>
          </svg>
        </div>
        
        {/* Medical Scissors */}
        <div className="absolute top-1/2 right-1/4 w-10 h-10 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
            <path d="M9.62,12L12,5.67L14.37,12M11,13L8.16,20.84C7.87,21.53 7.16,21.85 6.47,21.56C5.78,21.27 5.46,20.56 5.75,19.87L8.59,12.03L11,13M20.16,5.84L17.32,13.68L14.91,12.71L17.75,4.87C18.04,4.18 18.75,3.86 19.44,4.15C20.13,4.44 20.45,5.15 20.16,5.84M6.47,21.56C7.16,21.85 7.87,21.53 8.16,20.84L11,13L8.59,12.03L5.75,19.87C5.46,20.56 5.78,21.27 6.47,21.56Z"/>
          </svg>
        </div>
        
        {/* Medical Bandage */}
        <div className="absolute bottom-16 left-2/3 w-16 h-8 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
            <path d="M21.5,7.5L19,5L12,12L5,5L2.5,7.5L9.5,14.5L2.5,21.5L5,24L12,17L19,24L21.5,21.5L14.5,14.5L21.5,7.5Z"/>
          </svg>
        </div>
        
        {/* Medical Test Tube */}
        <div className="absolute top-3/4 left-1/4 w-4 h-12 opacity-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
            <path d="M7,2V4H8V18A4,4 0 0,0 12,22A4,4 0 0,0 16,18V4H17V2H7M11,16C10.4,16 10,15.6 10,15C10,14.4 10.4,14 11,14C11.6,14 12,14.4 12,15C12,15.6 11.6,16 11,16M13,12C12.4,12 12,11.6 12,11C12,10.4 12.4,10 13,10C13.6,10 14,10.4 14,11C14,11.6 13.6,12 13,12M14,7H10V4H14V7Z"/>
          </svg>
        </div>
        
        {/* Additional Medical Elements - Batch 2 */}
        {/* Medical Mask */}
        <div className="absolute top-1/6 right-1/3 w-12 h-8 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
            <path d="M20,6C18,6 16,5 16,5L12,1L8,5C8,5 6,6 4,6C2,6 2,8 2,8C2,8 2,10 4,10C4,10 4,11 4,12C4,16 8,20 12,20C16,20 20,16 20,12C20,11 20,10 20,10C22,10 22,8 22,8C22,8 22,6 20,6Z"/>
          </svg>
        </div>
        
        {/* Medical Wheelchair */}
        <div className="absolute bottom-1/3 left-1/5 w-12 h-12 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
            <path d="M18.08,15.14L20.44,12.78C20.78,12.44 21,12 21,11.5C21,10.12 19.88,9 18.5,9H16.5V11H18.5C18.78,11 19,11.22 19,11.5C19,11.64 18.94,11.77 18.83,11.88L16.47,14.24L18.08,15.14M12.5,9C13.88,9 15,7.88 15,6.5C15,5.12 13.88,4 12.5,4C11.12,4 10,5.12 10,6.5C10,7.88 11.12,9 12.5,9M12.5,6C12.78,6 13,6.22 13,6.5C13,6.78 12.78,7 12.5,7C12.22,7 12,6.78 12,6.5C12,6.22 12.22,6 12.5,6M7.82,20L8.5,19.32L9.18,20H7.82M9.5,13L6.5,16H4V18H6.5L9.5,15L12.5,18H15V16H12.5L9.5,13M20.5,16H18V18H20.5V16Z"/>
          </svg>
        </div>
        
        {/* Medical Prescription */}
        <div className="absolute top-1/2 left-1/6 w-10 h-12 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
            <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M10,17H8V14H10V17M14,17H12V14H14V17M18,17H16V14H18V17Z"/>
          </svg>
        </div>
        
        {/* Medical Pulse */}
        <div className="absolute bottom-1/6 right-1/6 w-20 h-8 opacity-12">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500" strokeWidth="2">
            <path d="M2,12 L6,12 L8,8 L10,16 L12,6 L14,14 L16,10 L18,12 L22,12"/>
          </svg>
        </div>
        
        {/* Medical DNA Strand */}
        <div className="absolute top-1/5 left-1/2 w-8 h-16 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-cyan-500">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
        </div>
        
        {/* Medical Microscope */}
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
            <path d="M9.5,3.5C9.5,2.67 10.17,2 11,2C11.83,2 12.5,2.67 12.5,3.5C12.5,4.33 11.83,5 11,5C10.17,5 9.5,4.33 9.5,3.5M11,7L8.5,12.5L11,10.5V22H13V10.5L15.5,12.5L13,7H11M7,22H17V20H7V22Z"/>
          </svg>
        </div>
        
        {/* Additional Medical Elements - Batch 3 (Bottom-Left & Bottom-Middle Spread) */}
        {/* Medical Pills */}
        <div className="absolute bottom-20 left-8 w-6 h-12 opacity-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-pink-600">
            <path d="M10,2A2,2 0 0,0 8,4V8A2,2 0 0,0 10,10H14A2,2 0 0,0 16,8V4A2,2 0 0,0 14,2H10M10,4H14V8H10V4M8,12A2,2 0 0,0 6,14V18A2,2 0 0,0 8,20H16A2,2 0 0,0 18,18V14A2,2 0 0,0 16,12H8M8,14H16V18H8V14Z"/>
          </svg>
        </div>
        
        {/* Medical Injection */}
        <div className="absolute bottom-32 left-20 w-8 h-8 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
            <path d="M7,2V4H8V18A4,4 0 0,0 12,22A4,4 0 0,0 16,18V4H17V2H7M11,16C10.4,16 10,15.6 10,15C10,14.4 10.4,14 11,14C11.6,14 12,14.4 12,15C12,15.6 11.6,16 11,16M13,12C12.4,12 12,11.6 12,11C12,10.4 12.4,10 13,10C13.6,10 14,10.4 14,11C14,11.6 13.6,12 13,12M14,7H10V4H14V7Z"/>
          </svg>
        </div>
        
        {/* Medical Brain */}
        <div className="absolute bottom-16 left-36 w-14 h-14 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
        </div>
        
        {/* Medical Stethoscope 2 */}
        <div className="absolute bottom-40 left-1/3 w-8 h-8 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
            <path d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
          </svg>
        </div>
        
        {/* Medical Syringe 2 */}
        <div className="absolute bottom-28 left-1/2 w-10 h-6 opacity-12">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
            <path d="M7,2V4H8V18A4,4 0 0,0 12,22A4,4 0 0,0 16,18V4H17V2H7M11,16C10.4,16 10,15.6 10,15C10,14.4 10.4,14 11,14C11.6,14 12,14.4 12,15C12,15.6 11.6,16 11,16M13,12C12.4,12 12,11.6 12,11C12,10.4 12.4,10 13,10C13.6,10 14,10.4 14,11C14,11.6 13.6,12 13,12M14,7H10V4H14V7Z"/>
          </svg>
        </div>
        
        {/* Medical Plus Sign 4 */}
        <div className="absolute bottom-24 left-2/5 w-6 h-6 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </div>
        
        {/* Medical Heart 2 */}
        <div className="absolute bottom-36 left-3/5 w-8 h-8 opacity-8">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
          </svg>
        </div>
      </div>
  );
};

export default MedicalBackground;