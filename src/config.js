// Configuration file for API URLs
const config = {
  development: {
    API_BASE_URL: "https://sqm-8vrc.onrender.com"  // Changed to Render for development
  },
  production: {
    API_BASE_URL: "https://sqm-8vrc.onrender.com"
  }
};

// Get current environment
const getEnvironment = () => {
  // Always use production URL for now (Render backend)
  return 'production';
  
  // Original logic - comment out for now
  // return window.location.hostname === 'localhost' ? 'development' : 'production';
};

// Get API URL for current environment
export const API_BASE_URL = config[getEnvironment()].API_BASE_URL;

console.log('🔗 Environment:', getEnvironment());
console.log('🌐 API Base URL:', API_BASE_URL);
