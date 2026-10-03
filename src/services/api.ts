import { Platform } from 'react-native';
import { User, UserRole } from '@/types';

/**
 * Configurable API Base URL
 * - Precedence: EXPO_PUBLIC_API_URL environment variable
 * - Fallback for Android emulator: http://10.0.2.2:5000/api (10.0.2.2 maps to host machine localhost)
 * - Fallback for Web/iOS Simulator: http://localhost:5000/api
 */
const getDefaultApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getDefaultApiBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AuthData {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
  rollNumber?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Handle API responses and extract meaningful user-facing errors
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
      };
    }
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected server response format',
    };
  }
};

/**
 * Safe fetch wrapper that handles network unreachable / server down errors
 */
const safeFetch = async (url: string, options: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    throw new Error(
      'Unable to connect to the CampusConnect server. Please verify backend is running and reachable.'
    );
  }
};

export const authApi = {
  /**
   * Register a new student or organizer
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthData>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await handleResponse<AuthData>(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during registration',
      };
    }
  },

  /**
   * Login user
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthData>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await handleResponse<AuthData>(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during login',
      };
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(token: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse<{ user: User }>(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error fetching user profile',
      };
    }
  },
};
