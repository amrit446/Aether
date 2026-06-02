import axios from 'axios';

// Create a configured axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors and handle common status codes
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server responded with an error payload
    if (error.response) {
      const { status, data } = error.response;
      
      // Normalize error details from backend schema validations
      let errorMessage = 'An unexpected error occurred.';
      if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.errors) {
        // Collect schema errors from Flask/Marshmallow
        errorMessage = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
      } else if (data && data.message) {
        errorMessage = data.message;
      }
      
      return Promise.reject({
        status,
        message: errorMessage,
        raw: data
      });
    }
    
    // In case of timeout or network disconnect
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to connect to the backend server. Please verify your connection or check if the backend is active.'
      });
    }
    
    return Promise.reject({
      status: -1,
      message: error.message
    });
  }
);

export default API;
