import { API_BASE_URL } from '../config.js';

// Helper function to get auth token from localStorage
export const getAuthToken = () => localStorage.getItem("token");

// Generic request handler
async function request(endpoint, options = {}) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging
  console.log('🚀 API Request:', {
    method: options.method || 'GET',
    url: fullUrl,
    headers: options.headers,
    body: options.body ? '[DATA]' : 'none'
  });

  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // Debug response
  console.log('📡 API Response:', {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    console.error('❌ API Error:', error);
    throw new Error(error.detail || "Something went wrong");
  }

  const data = await response.json();
  console.log('✅ API Success:', data);
  return data;
}

// Public APIs
export const publicApi = {
  getHospitals: () => request("/public/hospitals"),
  getServices: () => request("/services"),
};

// Authentication API
export const authApi = {
  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Staff APIs (Protected)
export const staffApi = {
  createAvailability: (data, token) =>
    request("/appointments/availability", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  callNext: (data, token) =>
    request("/queue/call-next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  skipPatient: (data, token) =>
    request("/queue/skip", {
      method: "POST", 
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
};

// Patient APIs
export const patientApi = {
  bookAppointment: (data) =>
    request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getQueueStatus: (hospitalServiceId, date) =>
    request(`/queue/status/${hospitalServiceId}/${date}`),
};
