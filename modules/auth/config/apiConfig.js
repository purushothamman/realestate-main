// config/apiConfig.js

// ==========================================
// API CONFIGURATION
// ==========================================

// Base URL - Update this to match your backend server
const BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-url.com/api'; // Production
  
// Alternative for Android emulator (if localhost doesn't work)
// const BASE_URL = __DEV__ 
//   ? 'http://10.0.2.2:3000/api'  // Android emulator
//   : 'https://your-production-url.com/api';

// Alternative for physical device on same network
// const BASE_URL = __DEV__ 
//   ? 'http://192.168.1.XXX:3000/api'  // Replace XXX with your IP
//   : 'https://your-production-url.com/api';

export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    
    // Password reset endpoints
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    
    // User endpoints
    USER_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    CHANGE_PASSWORD: '/user/change-password',
    
    // Property endpoints
    PROPERTIES: '/properties',
    PROPERTY_DETAILS: '/properties/:id',
  },
};

/**
 * Build full URL from endpoint
 * @param {string} endpoint - API endpoint path
 * @param {object} params - URL parameters to replace
 * @returns {string} - Full URL
 */
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace URL parameters like :id
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {Response} response - Fetch response object
 * @returns {object} - Formatted error info
 */
export const handleApiError = (error, response) => {
  // Network error
  if (error && !response) {
    if (error.name === 'AbortError') {
      return {
        type: 'timeout',
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT',
      };
    }
    
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }
  
  // HTTP error
  if (response && !response.ok) {
    const statusMessages = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please login again.',
      403: 'Access forbidden.',
      404: 'Resource not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
    };
    
    return {
      type: 'http',
      message: statusMessages[response.status] || 'An error occurred.',
      code: response.status,
    };
  }
  
  // Unknown error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN',
  };
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {string} token - Auth token (optional)
 * @returns {Promise} - Response promise
 */
export const apiRequest = async (endpoint, options = {}, token = null) => {
  const url = buildUrl(endpoint, options.params || {});
  
  const headers = {
    ...API_CONFIG.HEADERS,
    ...options.headers,
  };
  
  // Add auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
    
    if (!response.ok) {
      throw {
        response,
        data,
        message: data?.message || response.statusText,
      };
    }
    
    return { response, data };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Export default config
export default API_CONFIG;