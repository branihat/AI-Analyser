// API Configuration
export const API_CONFIG = {
  // Update this to match your Flask backend URL
  // For local development: 'http://localhost:5000'
  // For production: your production Flask URL
  baseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000',
  endpoints: {
    analyze: '/api/analyze'
  }
};