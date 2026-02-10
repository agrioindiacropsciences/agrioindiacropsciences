/**
 * API Module - All API functions for Agrio India Backend
 * Updated to match Backend API v2.1
 */

import { get, post, put, del, patch, patchFormData, setTokens, clearTokens, getAccessToken, ApiResponse, API_BASE_URL } from './client';
import type * as T from './types';

// Re-export types and utilities
export * from './types';
export { getAccessToken, setTokens, clearTokens } from './client';

// ==================== Auth APIs ====================

/**
 * Format phone number to 10-digit Indian mobile number
 * Backend expects 10 digits (without country code) and will add +91 internally for Twilio
 */
function formatPhoneNumber(phone: string): string {
  // Remove any existing country code, spaces, or special characters
  const cleaned = phone.replace(/\D/g, '');
  // Get last 10 digits (Indian mobile number)
  // This ensures we extract the 10-digit number even if user entered +91 prefix
  return cleaned.slice(-10);
}

/**
 * Send OTP to phone number via Twilio
 * Backend expects 10-digit Indian mobile number (6-9 followed by 9 digits)
 */
export async function sendOtp(phone_number: string): Promise<ApiResponse<T.SendOtpResponse>> {
  const formattedPhone = formatPhoneNumber(phone_number);
  return post<T.SendOtpResponse>('/auth/send-otp', { phone_number: formattedPhone });
}

/**
 * Verify OTP via Twilio and login/register
 * Backend expects 10-digit Indian mobile number (6-9 followed by 9 digits)
 */
export async function verifyOtp(phone_number: string, otp_code: string): Promise<ApiResponse<T.VerifyOtpResponse>> {
  const formattedPhone = formatPhoneNumber(phone_number);
  const response = await post<T.VerifyOtpResponse>('/auth/verify-otp', {
    phone_number: formattedPhone,
    otp_code
  });
  if (response.success && response.data) {
    setTokens(response.data.token, response.data.refresh_token);
  }
  return response;
}

/**
 * Dev Login - Development only, bypasses OTP
 */
export async function devLogin(phone_number: string): Promise<ApiResponse<T.DevLoginResponse>> {
  const response = await post<T.DevLoginResponse>('/auth/dev-login', { phone_number });
  if (response.success && response.data) {
    setTokens(response.data.token, response.data.refresh_token);
  }
  return response;
}

/**
 * Refresh access token
 */
export async function refreshToken(refresh_token: string): Promise<ApiResponse<T.RefreshTokenResponse>> {
  const response = await post<T.RefreshTokenResponse>('/auth/refresh-token', { refresh_token });
  if (response.success && response.data) {
    setTokens(response.data.token, response.data.refresh_token);
  }
  return response;
}

/**
 * Logout user
 */
export async function logout(): Promise<ApiResponse<null>> {
  const response = await post<null>('/auth/logout', {}, true);
  clearTokens();
  return response;
}

// ==================== User APIs ====================

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ApiResponse<T.User>> {
  return get<T.User>('/user/profile', true);
}

/**
 * Create user profile (new user registration)
 */
export async function createProfile(data: T.CreateProfileRequest): Promise<ApiResponse<T.User>> {
  return post<T.User>('/user/profile', data, true);
}

/**
 * Update user profile
 */
export async function updateProfile(data: T.UpdateProfileRequest): Promise<ApiResponse<T.User>> {
  return put<T.User>('/user/profile', data, true);
}

/**
 * Update profile avatar (multipart/form-data)
 */
export async function updateAvatar(imageFile: File): Promise<ApiResponse<{ profile_image_url: string; message: string }>> {
  const formData = new FormData();
  formData.append('avatar', imageFile);
  return patchFormData<{ profile_image_url: string; message: string }>('/user/profile/avatar', formData, true);
}

/**
 * Update user language preference
 */
export async function updateLanguage(language: 'en' | 'hi'): Promise<ApiResponse<null>> {
  return put<null>('/user/language', { language }, true);
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<ApiResponse<T.UserStats>> {
  return get<T.UserStats>('/user/stats', true);
}

/**
 * Get user crop preferences
 */
export async function getCropPreferences(): Promise<ApiResponse<T.UserCrops>> {
  return get<T.UserCrops>('/user/crops', true);
}

/**
 * Sync/Update crop preferences
 */
export async function syncCropPreferences(crop_ids: string[]): Promise<ApiResponse<null>> {
  return post<null>('/user/crops', { crop_ids }, true);
}

/**
 * Get user coupon history
 */
export async function getCouponHistory(): Promise<ApiResponse<T.CouponHistory[]>> {
  return get<T.CouponHistory[]>('/user/coupons', true);
}

/**
 * Get user rewards
 * Backend shape (simplified):
 * {
 *   success: true,
 *   data: {
 *     rewards: [
 *       {
 *         id, coupon_code, prize: { type, value, ... },
 *         product_name, status, won_at, redeemed_at, ...
 *       }
 *     ],
 *     summary, pagination...
 *   }
 * }
 *
 * We map this into a flat T.Reward[] view model used by the dashboard & My Rewards page.
 */
export async function getUserRewards(): Promise<ApiResponse<T.Reward[]>> {
  const res = await get<any>('/user/rewards', true);
  if (!res.success || !res.data) {
    return { success: res.success, error: res.error, data: [] };
  }

  const container = Array.isArray(res.data)
    ? res.data
    : (res.data.rewards || res.data.data || []);

  const mapped: T.Reward[] = (container || []).map((r: any) => {
    const prize = r.prize || {};
    const rawStatus: string = r.status || "";
    const mappedStatus: T.Reward["status"] =
      rawStatus === "CLAIMED" || rawStatus === "REDEEMED" || rawStatus === "VERIFIED"
        ? "CLAIMED"
        : "PENDING";

    return {
      id: r.id,
      type: prize.type || "UNKNOWN",
      amount: typeof prize.value === "number" ? prize.value : 0,
      status: mappedStatus,
      won_at: r.won_at || r.scanned_at || r.redeemed_at || "",
      product_name: r.product_name || "",
    };
  });

  return {
    success: true,
    data: mapped,
  };
}

// ==================== Crops APIs ====================
/**
 * Get all crops
 */
export async function getCrops(): Promise<ApiResponse<T.Crop[]>> {
  return get<T.Crop[]>('/crops');
}

/**
 * Get all crops (Admin)
 */
export async function getAdminCrops(query?: string): Promise<ApiResponse<T.Crop[]>> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  return adminGet<T.Crop[]>(`/crops?${params.toString()}`);
}

/**
 * Create crop
 */
export async function createCrop(data: any): Promise<ApiResponse<T.Crop>> {
  if (data instanceof FormData) {
    return adminPostFormData<T.Crop>('/crops', data);
  }
  return adminPost<T.Crop>('/crops', data);
}

/**
 * Update crop
 */
export async function updateCrop(id: string, data: any): Promise<ApiResponse<T.Crop>> {
  if (data instanceof FormData) {
    return adminPutFormData<T.Crop>(`/crops/${id}`, data);
  }
  return adminPut<T.Crop>(`/crops/${id}`, data);
}

/**
 * Delete crop
 */
export async function deleteCrop(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/crops/${id}`);
}

// ==================== Products APIs ====================

/**
 * Get all products with optional filters
 */
export async function getProducts(params: T.ProductsQuery = {}): Promise<ApiResponse<T.ProductsResponse>> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append('q', params.q);
  if (params.category) searchParams.append('category', params.category);
  if (params.crop) searchParams.append('crop', params.crop);
  if (params.best_seller !== undefined) searchParams.append('best_seller', String(params.best_seller));
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.sort) searchParams.append('sort', params.sort);

  const qs = searchParams.toString();
  return get<T.ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ApiResponse<T.Product>> {
  return get<T.Product>(`/products/${slug}`);
}

/**
 * Get best selling products
 */
export async function getBestSellers(limit = 8): Promise<ApiResponse<T.Product[]>> {
  return get<T.Product[]>(`/products/best-sellers?limit=${limit}`);
}

/**
 * Get new arrivals
 */
export async function getNewArrivals(limit = 8): Promise<ApiResponse<T.Product[]>> {
  return get<T.Product[]>(`/products/new-arrivals?limit=${limit}`);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 8): Promise<ApiResponse<T.Product[]>> {
  return get<T.Product[]>(`/products/featured?limit=${limit}`);
}

/**
 * Search products
 */
export async function searchProducts(q: string): Promise<ApiResponse<T.Product[]>> {
  return get<T.Product[]>(`/products/search?q=${encodeURIComponent(q)}`);
}

/**
 * Get recommended products (Auth Required)
 */
export async function getRecommendedProducts(limit = 10): Promise<ApiResponse<T.Product[]>> {
  return get<T.Product[]>(`/products/recommended?limit=${limit}`, true);
}

// ==================== Categories APIs ====================

/**
 * Get all categories
 */
export async function getCategories(): Promise<ApiResponse<T.Category[]>> {
  return get<T.Category[]>('/categories');
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<ApiResponse<T.Category>> {
  return get<T.Category>(`/categories/${id}`);
}

/**
 * Admin: list categories
 */
export async function getAdminCategories(): Promise<ApiResponse<T.Category[]>> {
  return adminGet<T.Category[]>('/admin/categories');
}

/**
 * Admin: update category (supports image upload via FormData)
 */
export async function updateAdminCategory(
  id: string,
  data: FormData | Partial<T.Category & { image_url?: string; is_active?: boolean; display_order?: number }>
): Promise<ApiResponse<T.Category>> {
  if (data instanceof FormData) {
    return adminPutFormData<T.Category>(`/admin/categories/${id}`, data);
  }
  return adminPut<T.Category>(`/admin/categories/${id}`, data);
}

// ==================== Distributors APIs ====================

/**
 * Get distributors by pincode or lat/lng (current location)
 * Backend returns { distributors, pagination } - we map to flat Distributor[] for frontend
 */
export async function getDistributors(params: T.DistributorsQuery): Promise<ApiResponse<T.Distributor[]>> {
  const searchParams = new URLSearchParams();
  if (params.pincode) searchParams.append('pincode', params.pincode);
  if (params.lat !== undefined) searchParams.append('lat', String(params.lat));
  if (params.lng !== undefined) searchParams.append('lng', String(params.lng));
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const res = await get<T.DistributorsResponse>(`/distributors?${searchParams.toString()}`);
  if (!res.success || !res.data) return res as ApiResponse<T.Distributor[]>;

  const raw = res.data;
  const list = (raw.distributors ?? raw.data ?? []) as unknown as Record<string, unknown>[];
  const mapped: T.Distributor[] = list.map((d) => {
    const addr = d.address as Record<string, string> | undefined;
    const loc = d.location as { lat?: number; lng?: number } | undefined;
    const addrParts = addr ? [addr.street, addr.area, addr.city].filter(Boolean) : [];
    return {
      id: d.id as string,
      name: d.name as string,
      owner_name: (d.owner_name ?? d.business_name ?? '') as string,
      address: (addr ? addrParts.join(', ') : (d.address as string) ?? '') as string,
      city: (addr?.city ?? d.city ?? '') as string,
      state: (addr?.state ?? d.state ?? '') as string,
      pincode: (addr?.pincode ?? d.pincode ?? '') as string,
      phone: d.phone as string,
      email: d.email as string | undefined,
      latitude: (loc?.lat ?? d.latitude) as number | undefined,
      longitude: (loc?.lng ?? d.longitude) as number | undefined,
      distance_km: d.distance_km as number | undefined,
      is_active: (d.is_active ?? true) as boolean,
    };
  });
  return { success: true, data: mapped };
}

/**
 * Get distributor by ID
 */
export async function getDistributorById(id: string): Promise<ApiResponse<T.Distributor>> {
  return get<T.Distributor>(`/distributors/${id}`);
}

/**
 * Get distributor coverage
 */
export async function getDistributorCoverage(id: string): Promise<ApiResponse<T.DistributorCoverage>> {
  return get<T.DistributorCoverage>(`/distributors/${id}/coverage`);
}

// ==================== Coupons APIs ====================

/**
 * Verify coupon code
 */
export async function verifyCoupon(coupon_code: string): Promise<ApiResponse<T.VerifyCouponResponse>> {
  return post<T.VerifyCouponResponse>('/coupons/verify', { coupon_code }, true);
}

/**
 * Redeem coupon (claim prize)
 */
export async function redeemCoupon(coupon_id: string, campaign_tier_id: string): Promise<ApiResponse<T.RedeemCouponResponse>> {
  return post<T.RedeemCouponResponse>('/coupons/redeem', { coupon_id, campaign_tier_id }, true);
}

// ==================== Scan & Redeem APIs ====================

/**
 * Scan and redeem QR code (combined action)
 */
export async function scanAndRedeem(code: string): Promise<ApiResponse<T.ScanRedeemResponse>> {
  return post<T.ScanRedeemResponse>('/scan/redeem', { code }, true);
}

// ==================== Rewards APIs ====================

/**
 * Get reward certificate
 */
export async function getRewardCertificate(reward_id: string): Promise<ApiResponse<T.CertificateResponse>> {
  return get<T.CertificateResponse>(`/rewards/${reward_id}/certificate`, true);
}

// ==================== Search APIs ====================

/**
 * Global search
 */
export async function search(q: string): Promise<ApiResponse<T.SearchResponse>> {
  return get<T.SearchResponse>(`/search?q=${encodeURIComponent(q)}`);
}

// ==================== Support APIs ====================

/**
 * Submit contact form (Auth optional)
 */
export async function submitContactForm(data: T.ContactFormRequest): Promise<ApiResponse<T.ContactFormResponse>> {
  return post<T.ContactFormResponse>('/support/contact', data);
}

/**
 * Get FAQs
 */
export async function getFaqs(): Promise<ApiResponse<T.FAQ[]>> {
  return get<T.FAQ[]>('/support/faqs');
}

/**
 * Get CMS page content (terms, privacy-policy, about)
 */
export async function getCmsPage(slug: string): Promise<ApiResponse<T.CmsPage>> {
  return get<T.CmsPage>(`/support/${slug}`);
}

// ==================== Notifications APIs ====================

/**
 * Get user notifications
 */
export async function getNotifications(
  params?: { page?: number; limit?: number; unread_only?: boolean; type?: T.Notification["type"] }
): Promise<ApiResponse<T.NotificationsResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.unread_only !== undefined) searchParams.append("unread_only", String(params.unread_only));
  if (params?.type) searchParams.append("type", params.type);
  const qs = searchParams.toString();
  return get<T.NotificationsResponse>(`/notifications${qs ? `?${qs}` : ""}`, true);
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(id: string): Promise<ApiResponse<null>> {
  return put<null>(`/notifications/${id}/read`, {}, true);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<ApiResponse<null>> {
  return put<null>('/notifications/read-all', {}, true);
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<ApiResponse<null>> {
  return del<null>(`/notifications/${id}`, true);
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<ApiResponse<null>> {
  return del<null>('/notifications', true);
}

// ==================== Admin Notifications APIs (requires backend support) ====================
export async function adminListNotifications(
  page = 1,
  limit = 20
): Promise<ApiResponse<T.AdminNotificationsResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return adminGet<T.AdminNotificationsResponse>(`/admin/notifications?${params.toString()}`);
}

export async function adminSendNotification(
  payload: T.AdminCreateNotificationRequest
): Promise<ApiResponse<T.AdminNotification>> {
  return adminPost<T.AdminNotification>('/admin/notifications', payload);
}

/**
 * Admin sends push notification via FCM and creates DB notifications for all users
 * Backend: POST /api/v1/fcm/send
 */
export async function adminSendFcmNotification(
  payload: T.AdminFcmSendRequest
): Promise<ApiResponse<unknown>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const apiBase = API_BASE_URL;
  try {
    const res = await fetch(`${apiBase}/fcm/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (error) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}

// ==================== Config APIs ====================

/**
 * Get app config
 */
export async function getAppConfig(): Promise<ApiResponse<T.AppConfig>> {
  return get<T.AppConfig>('/config');
}

/**
 * Get banners
 */
export async function getBanners(): Promise<ApiResponse<T.Banner[]>> {
  return get<T.Banner[]>('/config/banners');
}

// ==================== Admin APIs ====================

const ADMIN_TOKEN_KEY = 'agrio_admin_token';
const ADMIN_REFRESH_KEY = 'agrio_admin_refresh';

export const getAdminToken = () => typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
export const setAdminTokens = (t: string, r: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, t);
  localStorage.setItem(ADMIN_REFRESH_KEY, r);
};
export const clearAdminTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
};

/**
 * Admin login
 */
export async function adminLogin(email: string, password: string): Promise<ApiResponse<T.AdminLoginResponse>> {
  const response = await post<T.AdminLoginResponse>('/admin/auth/login', { email, password });
  if (response.success && response.data) {
    setAdminTokens(response.data.token, response.data.refresh_token);
  }
  return response;
}

/**
 * Admin refresh token
 */
export async function adminRefreshToken(): Promise<ApiResponse<T.RefreshTokenResponse>> {
  const refresh_token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_REFRESH_KEY) : null;
  if (!refresh_token) return { success: false, error: { code: 'NO_TOKEN', message: 'No refresh token' } };

  const response = await post<T.RefreshTokenResponse>('/admin/auth/refresh', { refresh_token });
  if (response.success && response.data) {
    setAdminTokens(response.data.token, response.data.refresh_token);
  }
  return response;
}

/**
 * Admin logout
 */
export async function adminLogout(): Promise<void> {
  clearAdminTokens();
}

/**
 * Get dashboard stats
 * Maps backend response (total_scans) to frontend format (total_coupons_scanned)
 */
export async function getDashboardStats(): Promise<ApiResponse<T.DashboardStats>> {
  const res = await adminGet<Record<string, unknown>>('/admin/dashboard/stats');
  if (!res.success || !res.data) return res as unknown as ApiResponse<T.DashboardStats>;
  const d = res.data;
  return {
    success: true,
    data: {
      total_users: d.total_users as number,
      total_coupons_scanned: (d.total_scans ?? d.total_coupons_scanned) as number,
      total_revenue: d.total_revenue as number,
      total_products: d.total_products as number,
      user_growth: d.user_growth as number,
      active_users: d.active_users as number,
      total_scans: d.total_scans as number,
      scan_growth: d.scan_growth as number,
      coupons_redeemed: d.coupons_redeemed as number,
      redemption_growth: d.redemption_growth as number,
      total_distributors: d.total_distributors as number,
      new_registrations_today: d.new_registrations_today as number,
      scans_per_day: d.scans_per_day as { date: string; value: number }[],
      crop_preferences: d.crop_preferences as { name: string; value: number }[],
      top_states: d.top_states as { state: string; users: number }[],
    } as T.DashboardStats,
  };
}

// Admin-specific request helper
async function adminGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function adminPost<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function adminPut<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function adminDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function adminPostFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

async function adminPutFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: data?.error || { code: 'REQUEST_FAILED', message: data?.message || `Request failed (${response.status})` },
      } as ApiResponse<T>;
    }
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    } as ApiResponse<T>;
  }
}

// Admin Users
export async function getAdminUsers(
  pageOrOptions: number | { page?: number; limit?: number; query?: string; status?: string } = 1,
  limit = 10,
  query?: string,
  status?: string
): Promise<ApiResponse<T.AdminUsersResponse>> {
  let page = 1;
  let q = query;
  let l = limit;
  let s = status;

  if (typeof pageOrOptions === 'object') {
    page = pageOrOptions.page || 1;
    l = pageOrOptions.limit || 10;
    q = pageOrOptions.query;
    s = pageOrOptions.status;
  } else {
    page = pageOrOptions;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(l) });
  if (q) params.append('q', q);
  if (s) params.append('status', s);
  return adminGet<T.AdminUsersResponse>(`/admin/users?${params.toString()}`);
}

export async function getAdminUserDetails(id: string): Promise<ApiResponse<T.AdminUser>> {
  return adminGet<T.AdminUser>(`/admin/users/${id}`);
}

export async function exportUsers(): Promise<Blob> {
  const token = getAdminToken();
  if (!token) throw new Error('Admin token not found');

  const response = await fetch(`${API_BASE_URL}/admin/users/export`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export users');
  }

  return response.blob();
}

export async function updateUserStatus(id: string, is_active: boolean): Promise<ApiResponse<null>> {
  return adminPut<null>(`/admin/users/${id}/status`, { is_active });
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/users/${id}`);
}

// Admin Products
export async function getAdminProducts(
  pageOrOptions: number | { page?: number; limit?: number; category?: string } = 1,
  limit = 10,
  category?: string
): Promise<ApiResponse<T.ProductsResponse>> {
  let page = 1;
  let cat = category;
  let l = limit;

  if (typeof pageOrOptions === 'object') {
    page = pageOrOptions.page || 1;
    l = pageOrOptions.limit || 10;
    cat = pageOrOptions.category;
  } else {
    page = pageOrOptions;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(l) });
  if (cat) params.append('category', cat);
  return adminGet<T.ProductsResponse>(`/admin/products?${params.toString()}`);
}

export async function getAdminProduct(id: string): Promise<ApiResponse<T.Product>> {
  return adminGet<T.Product>(`/admin/products/${id}`);
}

export async function createProduct(data: T.CreateProductRequest): Promise<ApiResponse<T.Product>> {
  return adminPost<T.Product>('/admin/products', data);
}

export async function createProductWithFiles(formData: FormData): Promise<ApiResponse<T.Product>> {
  return adminPostFormData<T.Product>('/admin/products', formData);
}

export async function updateProduct(id: string, data: Partial<T.CreateProductRequest>): Promise<ApiResponse<T.Product>> {
  return adminPut<T.Product>(`/admin/products/${id}`, data);
}

export async function updateProductWithFiles(id: string, formData: FormData): Promise<ApiResponse<T.Product>> {
  return adminPutFormData<T.Product>(`/admin/products/${id}`, formData);
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/products/${id}`);
}

// Admin Coupons
export async function getAdminCoupons(
  pageOrOptions: number | { page?: number; limit?: number; status?: string } = 1,
  limit = 10,
  status?: string
): Promise<ApiResponse<T.AdminCouponsResponse>> {
  let page = 1;
  let s = status;
  let l = limit;

  if (typeof pageOrOptions === 'object') {
    page = pageOrOptions.page || 1;
    l = pageOrOptions.limit || 10;
    s = pageOrOptions.status;
  } else {
    page = pageOrOptions;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(l) });
  if (s) params.append('status', s);
  return adminGet<T.AdminCouponsResponse>(`/admin/coupons?${params.toString()}`);
}

export async function getAdminCoupon(id: string): Promise<ApiResponse<T.AdminCoupon>> {
  return adminGet<T.AdminCoupon>(`/admin/coupons/${id}`);
}

export async function deleteCoupon(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/coupons/${id}`);
}

export async function deleteCouponsBulk(ids: string[]): Promise<ApiResponse<{ deleted_count: number }>> {
  return adminPost<{ deleted_count: number }>('/admin/coupons/delete-bulk', { ids });
}

export async function generateCoupons(data: T.GenerateCouponsRequest): Promise<ApiResponse<T.GenerateCouponsResponse>> {
  return adminPost<T.GenerateCouponsResponse>('/admin/coupons/generate', data);
}

// Admin Campaigns
export async function getAdminCampaigns(
  pageOrOptions: number | { page?: number; limit?: number } = 1,
  limit = 100
): Promise<ApiResponse<T.CampaignsResponse>> {
  let page = 1;
  let l = limit;

  if (typeof pageOrOptions === 'object') {
    page = pageOrOptions.page || 1;
    l = pageOrOptions.limit || 100;
  } else {
    page = pageOrOptions;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(l) });
  return adminGet<T.CampaignsResponse>(`/admin/campaigns?${params.toString()}`);
}

export async function createCampaign(data: {
  name: string;
  name_hi?: string;
  start_date?: string;
  end_date?: string;
  distribution_type?: 'RANDOM' | 'SEQUENTIAL' | 'FIRST_COME';
  is_active?: boolean;
  tiers: T.CampaignTierConfig[];
}): Promise<ApiResponse<T.Campaign>> {
  return adminPost<T.Campaign>('/admin/campaigns', data);
}

export async function updateCampaign(id: string, data: {
  name?: string;
  name_hi?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<T.Campaign>> {
  return adminPut<T.Campaign>(`/admin/campaigns/${id}`, data);
}

export async function deleteCampaign(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/campaigns/${id}`);
}

// Admin Distributors
export async function getAdminDistributors(
  pageOrOptions: number | { page?: number; limit?: number } = 1,
  limit = 10
): Promise<ApiResponse<T.DistributorsResponse>> {
  let page = 1;
  let l = limit;

  if (typeof pageOrOptions === 'object') {
    page = pageOrOptions.page || 1;
    l = pageOrOptions.limit || 10;
  } else {
    page = pageOrOptions;
  }

  const params = new URLSearchParams({ page: String(page), limit: String(l) });
  return adminGet<T.DistributorsResponse>(`/admin/distributors?${params.toString()}`);
}

export async function getAdminDistributor(id: string): Promise<ApiResponse<T.Distributor>> {
  return adminGet<T.Distributor>(`/admin/distributors/${id}`);
}

export async function createDistributor(data: T.CreateDistributorRequest): Promise<ApiResponse<T.Distributor>> {
  return adminPost<T.Distributor>('/admin/distributors', data);
}

export async function updateDistributor(id: string, data: Partial<T.CreateDistributorRequest>): Promise<ApiResponse<T.Distributor>> {
  return adminPut<T.Distributor>(`/admin/distributors/${id}`, data);
}

export async function deleteDistributor(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/distributors/${id}`);
}

// Admin Settings
export async function getAdminSettings(): Promise<ApiResponse<Record<string, unknown>>> {
  return adminGet<Record<string, unknown>>('/admin/settings');
}

export async function updateAdminSettings(data: Record<string, unknown>): Promise<ApiResponse<null>> {
  return adminPut<null>('/admin/settings', data);
}

// Admin Reports
export async function getReport(
  type: string,
  dateRange?: { from?: string; to?: string } | string,
  to?: string
): Promise<ApiResponse<unknown>> {
  const params = new URLSearchParams();

  if (typeof dateRange === 'object') {
    if (dateRange.from) params.append('start_date', dateRange.from);
    if (dateRange.to) params.append('end_date', dateRange.to);
  } else if (dateRange) {
    params.append('start_date', dateRange);
    if (to) params.append('end_date', to);
  }

  const qs = params.toString();
  return adminGet<unknown>(`/admin/reports/${type}${qs ? `?${qs}` : ''}`);
}

export async function exportReport(
  type: string,
  dateRange?: { from?: string; to?: string } | string,
  to?: string
): Promise<ApiResponse<unknown>> {
  const params = new URLSearchParams();

  if (typeof dateRange === 'object') {
    if (dateRange.from) params.append('start_date', dateRange.from);
    if (dateRange.to) params.append('end_date', dateRange.to);
  } else if (dateRange) {
    params.append('start_date', dateRange);
    if (to) params.append('end_date', to);
  }

  const qs = params.toString();
  return adminGet<unknown>(`/admin/reports/${type}/export${qs ? `?${qs}` : ''}`);
}

// Admin Banners
export async function getAdminBanners(): Promise<ApiResponse<T.Banner[]>> {
  return adminGet<T.Banner[]>('/admin/banners');
}

export interface CreateBannerRequest {
  section: string;
  image_url: string;
  image_url_hi?: string;
  title?: string;
  link_type?: 'PRODUCT' | 'CATEGORY' | 'URL' | 'NONE';
  link_value?: string;
  display_order?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export async function createBanner(data: FormData | CreateBannerRequest): Promise<ApiResponse<T.Banner>> {
  const token = getAdminToken();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const isFormData = data instanceof FormData;
  const headers: HeadersInit = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(!isFormData && { 'Content-Type': 'application/json' }),
  };

  const body = isFormData ? data : JSON.stringify({
    section: (data as CreateBannerRequest).section,
    imageUrl: (data as CreateBannerRequest).image_url,
    imageUrlHi: (data as CreateBannerRequest).image_url_hi,
    title: (data as CreateBannerRequest).title,
    linkType: (data as CreateBannerRequest).link_type || 'NONE',
    linkValue: (data as CreateBannerRequest).link_value,
    displayOrder: (data as CreateBannerRequest).display_order || 0,
    startDate: (data as CreateBannerRequest).start_date,
    endDate: (data as CreateBannerRequest).end_date,
    isActive: (data as CreateBannerRequest).is_active !== false,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/admin/banners`, {
      method: 'POST',
      headers,
      body,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        error: data?.error || { code: 'REQUEST_FAILED', message: data?.message || `Request failed (${response.status})` },
      };
    }
    return data;
  } catch (error) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' },
    };
  }
}

export async function updateBanner(id: string, data: FormData | (Partial<T.Banner> & Partial<CreateBannerRequest>)): Promise<ApiResponse<T.Banner>> {
  if (data instanceof FormData) {
    return adminPutFormData<T.Banner>(`/admin/banners/${id}`, data);
  }
  const d = data as Record<string, unknown>;
  const mapped: Record<string, unknown> = {};
  if (d.section !== undefined) mapped.section = d.section;
  if (d.image_url !== undefined) mapped.imageUrl = d.image_url;
  if (d.image_url_hi !== undefined) mapped.imageUrlHi = d.image_url_hi;
  if (d.title !== undefined) mapped.title = d.title;
  if (d.link_type !== undefined) mapped.linkType = d.link_type;
  if (d.link_value !== undefined) mapped.linkValue = d.link_value;
  if (d.display_order !== undefined) mapped.displayOrder = d.display_order;
  if (d.start_date !== undefined) mapped.startDate = d.start_date;
  if (d.end_date !== undefined) mapped.endDate = d.end_date;
  if (d.is_active !== undefined) mapped.isActive = d.is_active;
  return adminPut<T.Banner>(`/admin/banners/${id}`, Object.keys(mapped).length ? mapped : data);
}

export async function deleteBanner(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/banners/${id}`);
}

// Admin CMS
export async function getAdminFaqs(): Promise<ApiResponse<T.FAQ[]>> {
  return adminGet<T.FAQ[]>('/admin/cms/faqs');
}

export async function createFaq(data: Partial<T.FAQ>): Promise<ApiResponse<T.FAQ>> {
  return adminPost<T.FAQ>('/admin/cms/faqs', data);
}

export async function updateFaq(id: string, data: Partial<T.FAQ>): Promise<ApiResponse<T.FAQ>> {
  return adminPut<T.FAQ>(`/admin/cms/faqs/${id}`, data);
}

export async function deleteFaq(id: string): Promise<ApiResponse<null>> {
  return adminDelete<null>(`/admin/cms/faqs/${id}`);
}

export async function getAdminPages(): Promise<ApiResponse<T.CmsPage[]>> {
  return adminGet<T.CmsPage[]>('/admin/cms/pages');
}

export async function updatePage(slug: string, data: Partial<T.CmsPage>): Promise<ApiResponse<T.CmsPage>> {
  return adminPut<T.CmsPage>(`/admin/cms/pages/${slug}`, data);
}

// ==================== Namespace Exports for Backwards Compatibility ====================

// Products API namespace
export const productsApi = {
  getAll: getProducts,
  getBySlug: getProductBySlug,
  getBestSellers,
  getNewArrivals,
  getFeatured: getFeaturedProducts,
  search: searchProducts,
  getRecommended: getRecommendedProducts,
};

// Categories API namespace
export const categoriesApi = {
  getAll: getCategories,
  getById: getCategoryById,
};

// Crops API namespace
export const cropsApi = {
  getAll: getCrops,
};

// Distributors API namespace
export const distributorsApi = {
  search: getDistributors,
  searchByPincode: (pincode: string) => getDistributors({ pincode }),
  getById: getDistributorById,
  getCoverage: getDistributorCoverage,
};

// Coupons API namespace
export const couponsApi = {
  verify: verifyCoupon,
  redeem: redeemCoupon,
  scanAndRedeem,
};

// User API namespace
export const userApi = {
  getProfile,
  createProfile,
  updateProfile,
  updateAvatar,
  updateLanguage,
  getStats: getUserStats,
  getCropPreferences,
  syncCropPreferences,
  getCouponHistory,
  getRewards: getUserRewards,
};

// Auth API namespace
export const authApi = {
  sendOtp,
  verifyOtp,
  devLogin,
  refreshToken,
  logout,
};

// Support API namespace
export const supportApi = {
  submitContactForm,
  getFaqs,
  getCmsPage,
};

// Notifications API namespace
export const notificationsApi = {
  getAll: getNotifications,
  markRead: markNotificationRead,
  markAllRead: markAllNotificationsRead,
  delete: deleteNotification,
  deleteAll: deleteAllNotifications,
};

// Config API namespace
export const configApi = {
  getAppConfig,
  getBanners,
};

// Rewards API namespace
export const rewardsApi = {
  getCertificate: getRewardCertificate,
};

// Admin API namespace
export const adminApi = {
  login: adminLogin,
  refreshToken: adminRefreshToken,
  logout: adminLogout,
  getDashboardStats,
  // Users
  getUsers: getAdminUsers,
  getUserDetails: getAdminUserDetails,
  exportUsers,
  updateUserStatus,
  // Products
  getProducts: getAdminProducts,
  getProduct: getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  // Coupons
  getCoupons: getAdminCoupons,
  getCoupon: getAdminCoupon,
  generateCoupons,
  // Campaigns
  getCampaigns: getAdminCampaigns,
  createCampaign,
  // Distributors
  getDistributors: getAdminDistributors,
  getDistributor: getAdminDistributor,
  createDistributor,
  updateDistributor,
  deleteDistributor,
  // Settings
  getSettings: getAdminSettings,
  updateSettings: updateAdminSettings,
  // Reports
  getReport,
  exportReport,
  // Banners
  getBanners: getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  // CMS
  getFaqs: getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getPages: getAdminPages,
  updatePage,
};
