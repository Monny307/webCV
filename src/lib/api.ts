// API Configuration for Backend Connection
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Jobs
  JOBS: `${API_BASE_URL}/api/jobs`,
  JOB_DETAIL: (id: string) => `${API_BASE_URL}/api/jobs/${id}`,

  // Applications
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  APPLICATION_DETAIL: (id: string) => `${API_BASE_URL}/api/applications/${id}`,
  CHECK_APPLICATION: (jobId: string) => `${API_BASE_URL}/api/applications/check/${jobId}`,
  MANUAL_APPLICATION: `${API_BASE_URL}/api/applications/manual`,

  // Profile
  PROFILE: `${API_BASE_URL}/api/profile`,
  UPLOAD_CV: `${API_BASE_URL}/api/profile/upload-cv`,
  CVS: `${API_BASE_URL}/api/profile/cvs`,
  SET_ACTIVE_CV: (id: string) => `${API_BASE_URL}/api/profile/cvs/${id}/set-active`,

  // Job Alerts
  JOB_ALERTS: `${API_BASE_URL}/api/job-alerts`,
  JOB_ALERT_DETAIL: (id: string) => `${API_BASE_URL}/api/job-alerts/${id}`,

  // Saved Jobs
  SAVED_JOBS: `${API_BASE_URL}/api/saved-jobs`,
  SAVED_JOB: (jobId: string) => `${API_BASE_URL}/api/saved-jobs/${jobId}`,
  SAVED_JOB_IDS: `${API_BASE_URL}/api/saved-jobs/ids`,

  // Contact
  CONTACT: `${API_BASE_URL}/api/contact`,

  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_DETAIL: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
  ADMIN_APPLICATIONS: `${API_BASE_URL}/api/admin/applications`,
  ADMIN_APPLICATION_DETAIL: (id: string) => `${API_BASE_URL}/api/admin/applications/${id}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API client with common methods
const api = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    return response.json();
  },

  post: async (endpoint: string, data?: any, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
    return response.json();
  },

  put: async (endpoint: string, data?: any, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
    return response.json();
  },

  delete: async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    return response.json();
  },
};

export default api;
