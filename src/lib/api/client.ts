/**
 * API Client for Agrio India Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agrio-india-backend.onrender.com/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Token Management
const TOKEN_KEY = 'agrio_access_token';
const REFRESH_TOKEN_KEY = 'agrio_refresh_token';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request Handler
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - try refresh
    if (response.status === 401 && requireAuth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        return retryResponse.json();
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } };
      }
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        setTokens(data.data.token, data.data.refresh_token);
        return true;
      }
    }
  } catch {
    console.error('Token refresh failed');
  }
  return false;
}

// HTTP Methods
export const get = <T>(endpoint: string, auth = false) =>
  request<T>(endpoint, { method: 'GET' }, auth);

export const post = <T>(endpoint: string, body: unknown, auth = false) =>
  request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, auth);

export const put = <T>(endpoint: string, body: unknown, auth = false) =>
  request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }, auth);

export const patch = <T>(endpoint: string, body: unknown, auth = false) =>
  request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, auth);

export const del = <T>(endpoint: string, auth = false) =>
  request<T>(endpoint, { method: 'DELETE' }, auth);

// FormData upload helper (for file uploads)
export async function postFormData<T>(endpoint: string, formData: FormData, auth = false): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  // Don't set Content-Type - browser will set it with boundary for FormData

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Handle 401 - try refresh
    if (response.status === 401 && auth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: formData,
        });
        return retryResponse.json();
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } };
      }
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

export async function patchFormData<T>(endpoint: string, formData: FormData, auth = false): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {};

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    // Handle 401 - try refresh
    if (response.status === 401 && auth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers,
          body: formData,
        });
        return retryResponse.json();
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } };
      }
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

export { API_BASE_URL };

