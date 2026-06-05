import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {  // ✅ async so we can await the retry delay
    if (error.response) {
      const { status, data } = error.response;

      let errorMessage = 'An unexpected error occurred.';
      if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.errors) {
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

    if (error.request) {
      const originalRequest = error.config;

      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }

      if (originalRequest._retryCount < 5) {
        originalRequest._retryCount += 1;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        return API(originalRequest);
      }

      return Promise.reject({
        status: 0,
        message: 'Unable to connect to the backend server'
      });
    }

    return Promise.reject({
      status: -1,
      message: error.message
    });
  }
);

export default API;