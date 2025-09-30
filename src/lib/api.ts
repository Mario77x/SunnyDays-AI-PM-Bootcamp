// API configuration and utilities for SunnyDays frontend
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/v1/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
  },
  // Activity endpoints
  ACTIVITIES: {
    BASE: `${API_BASE_URL}/api/v1/activities`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/activities/${id}`,
  },
  // Weather advice endpoints
  WEATHER: {
    ADVICE: `${API_BASE_URL}/api/v1/weather-advice`,
    HEALTH: `${API_BASE_URL}/api/v1/weather-advice/health`,
  },
  // Health check
  HEALTH: `${API_BASE_URL}/healthz`,
} as const;

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// Token management
export const TOKEN_KEY = 'sunnydays_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API request helper with authentication
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle API errors
      const errorMessage = data?.detail || data?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Specific API methods
export const api = {
  // GET request
  get: <T = any>(url: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  // POST request
  post: <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // PUT request
  put: <T = any>(url: string, data?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  // DELETE request
  delete: <T = any>(url: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};