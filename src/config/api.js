// Centralized API configuration for local development and production deployment (Render, Vercel, etc.)

export const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default API_BASE;
