import { Platform } from 'react-native';
import { CampusEvent, EventStatus, Registration, User, UserRole } from '@/types';



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

export interface EventQueryParams {
  category?: string;
  status?: string;
  search?: string;
  mine?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  venue: string;
  maxCapacity: number;
  status?: EventStatus;
}


/**
 * Normalizes backend event document to mobile CampusEvent interface
 */
export const normalizeEvent = (e: any): CampusEvent => ({
  id: e.id || e._id?.toString() || '',
  title: e.title || '',
  description: e.description || '',
  category: e.category,
  bannerUrl: e.bannerUrl || '',
  startDate: typeof e.startDate === 'string' ? e.startDate : new Date(e.startDate).toISOString(),
  endDate: typeof e.endDate === 'string' ? e.endDate : new Date(e.endDate).toISOString(),
  venue: e.venue || '',
  maxCapacity: Number(e.maxCapacity) || 0,
  registeredCount: Number(e.registeredCount) || 0,
  organizerId: typeof e.organizerId === 'object' ? e.organizerId._id?.toString() : e.organizerId || '',
  organizerName: e.organizerName || e.organizerDetails?.name || 'Campus Organizer',
  organizerContact: e.organizerContact || e.organizerDetails?.contact || '',
  status: e.status || 'published',
  createdAt: e.createdAt,
});

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

export const eventApi = {
  /**
   * Get events with optional filters (category, search, status, mine, pagination)
   */
  async getEvents(
    params?: EventQueryParams,
    token?: string | null
  ): Promise<ApiResponse<{ events: CampusEvent[]; pagination: any }>> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      if (params?.mine) query.append('mine', 'true');
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const url = `${API_BASE_URL}/events${query.toString() ? `?${query.toString()}` : ''}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await safeFetch(url, {
        method: 'GET',
        headers,
      });

      const res = await handleResponse<{ events: any[]; pagination: any }>(response);
      if (res.success && res.data?.events) {
        return {
          success: true,
          data: {
            events: res.data.events.map(normalizeEvent),
            pagination: res.data.pagination,
          },
        };
      }
      return res as any;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to fetch events from server',
      };
    }
  },

  /**
   * Get single event by ID
   */
  async getEventById(
    id: string,
    token?: string | null
  ): Promise<ApiResponse<{ event: CampusEvent }>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await safeFetch(`${API_BASE_URL}/events/${id}`, {
        method: 'GET',
        headers,
      });

      const res = await handleResponse<{ event: any }>(response);
      if (res.success && res.data?.event) {
        return {
          success: true,
          data: {
            event: normalizeEvent(res.data.event),
          },
        };
      }
      return res as any;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to retrieve event details',
      };
    }
  },

  /**
   * Create new event (Organizer/Admin only)
   */
  async createEvent(
    payload: CreateEventPayload,
    token: string
  ): Promise<ApiResponse<{ event: CampusEvent }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const res = await handleResponse<{ event: any }>(response);
      if (res.success && res.data?.event) {
        return {
          success: true,
          message: res.message,
          data: {
            event: normalizeEvent(res.data.event),
          },
        };
      }
      return res as any;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to create event on server',
      };
    }
  },

  /**
   * Update existing event (Organizer/Admin only)
   */
  async updateEvent(
    id: string,
    payload: Partial<CreateEventPayload>,
    token: string
  ): Promise<ApiResponse<{ event: CampusEvent }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const res = await handleResponse<{ event: any }>(response);
      if (res.success && res.data?.event) {
        return {
          success: true,
          message: res.message,
          data: {
            event: normalizeEvent(res.data.event),
          },
        };
      }
      return res as any;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to update event on server',
      };
    }
  },

  /**
   * Cancel event (Organizer/Admin only)
   */
  async cancelEvent(
    id: string,
    token: string
  ): Promise<ApiResponse<{ event: CampusEvent }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await handleResponse<{ event: any }>(response);
      if (res.success && res.data?.event) {
        return {
          success: true,
          message: res.message,
          data: {
            event: normalizeEvent(res.data.event),
          },
        };
      }
      return res as any;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to cancel event on server',
      };
    }
  },
};

export const registrationApi = {
  /**
   * Register for event
   */
  async registerForEvent(
    eventId: string,
    token: string
  ): Promise<ApiResponse<{ registration: Registration; ticketCode: string; event: any }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to register for event',
      };
    }
  },

  /**
   * Cancel registration
   */
  async cancelRegistration(
    eventId: string,
    token: string
  ): Promise<ApiResponse<{ registration: Registration }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to cancel registration',
      };
    }
  },

  /**
   * Get student's tickets and registrations
   */
  async getMyRegistrations(
    token: string,
    status?: string
  ): Promise<ApiResponse<{ registrations: Registration[] }>> {
    try {
      const query = status ? `?status=${status}` : '';
      const response = await safeFetch(`${API_BASE_URL}/students/my-registrations${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to retrieve registrations',
      };
    }
  },

  /**
   * Get attendee roster for event (Organizer/Admin)
   */
  async getEventAttendees(
    eventId: string,
    token: string
  ): Promise<ApiResponse<{ event: any; attendees: Registration[] }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to retrieve attendee list',
      };
    }
  },

  /**
   * Update attendance status
   */
  async updateAttendance(
    eventId: string,
    studentId: string,
    status: 'attended' | 'registered' | 'cancelled',
    token: string
  ): Promise<ApiResponse<{ registration: Registration }>> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/events/${eventId}/attendees/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to update attendance status',
      };
    }
  },
};

export interface UploadBannerResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const uploadApi = {
  /**
   * Upload event banner image to Cloudinary
   * POST /api/uploads/event-banner
   */
  async uploadEventBanner(
    imageUri: string,
    token: string
  ): Promise<ApiResponse<UploadBannerResponse>> {
    try {
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'banner.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      let type = 'image/jpeg';
      if (ext === 'png') type = 'image/png';
      else if (ext === 'webp') type = 'image/webp';

      // React Native FormData expects an object with uri, name, and type
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await safeFetch(`${API_BASE_URL}/uploads/event-banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do not set Content-Type header manually for FormData so boundary is generated automatically
        },
        body: formData,
      });

      return await handleResponse(response);
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to upload event banner',
      };
    }
  },
};

