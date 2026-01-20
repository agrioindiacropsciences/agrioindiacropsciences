'use client';

/**
 * React Hooks for API Data Fetching
 * Updated to work with Agrio India Backend API v2.1
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import type {
  User,
  UserStats,
  Product,
  ProductsQuery,
  Category,
  Crop,
  Distributor,
  DistributorsQuery,
  Reward,
  Notification,
  Banner,
  FAQ,
  DashboardStats,
  AdminUser,
  CouponHistory,
  UserCrops,
} from '@/lib/api';

// ==================== Generic Hook ====================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

function useApiCall<T>(
  fetcher: () => Promise<{ success: boolean; data?: T; error?: { message: string } }>,
  deps: unknown[] = [],
  immediate = true
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetcher();
      if (response.success && response.data !== undefined) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: response.error?.message || 'An error occurred' });
      }
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Error' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) fetch();
  }, [immediate, fetch]);

  return { ...state, refetch: fetch };
}

// ==================== Auth Hook ====================

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getAccessToken();
      if (token) {
        const response = await api.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (phone: string, otp: string) => {
    const response = await api.verifyOtp(phone, otp);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, isNewUser: response.data.is_new_user };
    }
    return { success: false, error: response.error?.message };
  };

  const devLogin = async (phone: string) => {
    const response = await api.devLogin(phone);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, isNewUser: response.data.is_new_user };
    }
    return { success: false, error: response.error?.message };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return { isAuthenticated, isLoading, user, login, devLogin, logout, setUser: updateUser };
}

// ==================== User Hooks ====================

export function useProfile() {
  return useApiCall<User>(() => api.getProfile(), []);
}

export function useUserStats() {
  return useApiCall<UserStats>(() => api.getUserStats(), []);
}

export function useUserRewards() {
  return useApiCall<Reward[]>(() => api.getUserRewards(), []);
}

export function useCouponHistory() {
  return useApiCall<CouponHistory[]>(() => api.getCouponHistory(), []);
}

export function useCropPreferences() {
  return useApiCall<UserCrops>(() => api.getCropPreferences(), []);
}

// ==================== Products Hooks ====================

export function useProducts(params: ProductsQuery = {}) {
  const key = JSON.stringify(params);
  return useApiCall(
    async () => {
      const response = await api.getProducts(params);
      if (response.success && response.data) {
        return { success: true, data: response.data.products };
      }
      return response as { success: boolean; data?: Product[]; error?: { message: string } };
    },
    [key]
  );
}

export function useProduct(slug: string) {
  return useApiCall<Product>(() => api.getProductBySlug(slug), [slug], !!slug);
}

export function useBestSellers(limit = 8) {
  return useApiCall<Product[]>(() => api.getBestSellers(limit), [limit]);
}

export function useNewArrivals(limit = 8) {
  return useApiCall<Product[]>(() => api.getNewArrivals(limit), [limit]);
}

export function useFeaturedProducts(limit = 8) {
  return useApiCall<Product[]>(() => api.getFeaturedProducts(limit), [limit]);
}

export function useCategories() {
  return useApiCall<Category[]>(() => api.getCategories(), []);
}

export function useCrops() {
  return useApiCall<Crop[]>(() => api.getCrops(), []);
}

// ==================== Distributors Hooks ====================

export function useDistributors(params: DistributorsQuery | null) {
  return useApiCall<Distributor[]>(
    async () => {
      if (!params) return { success: true, data: [] };
      return api.getDistributors(params);
    },
    [JSON.stringify(params)],
    !!params
  );
}

export function useDistributor(id: string | null) {
  return useApiCall<Distributor>(
    () => id ? api.getDistributorById(id) : Promise.resolve({ success: false }),
    [id],
    !!id
  );
}

// ==================== Notifications Hooks ====================

export function useNotifications() {
  return useApiCall<{ notifications: Notification[]; unread_count: number }>(
    async () => {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        return {
          success: true,
          data: {
            notifications: res.data.notifications || [],
            unread_count: res.data.unread_count || 0,
          },
        };
      }
      return { success: true, data: { notifications: [], unread_count: 0 } };
    },
    []
  );
}

// ==================== Config Hooks ====================

export function useBanners() {
  return useApiCall<Banner[]>(() => api.getBanners(), []);
}

export function useFaqs() {
  return useApiCall<FAQ[]>(() => api.getFaqs(), []);
}

// ==================== Search Hook ====================

export function useSearch(query: string) {
  const [results, setResults] = useState<{
    products: { id: string; name: string; slug: string; images?: string[] }[];
    categories: { id: string; name: string; slug: string }[];
    crops: { id: string; name: string; slug: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const response = await api.search(query);
      if (response.success && response.data) {
        setResults(response.data);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}

// ==================== Admin Hooks ====================

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = api.getAdminToken();
    if (token) {
      // Token exists, consider authenticated for now
      // In production, you might want to validate the token
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.adminLogin(email, password);
    if (response.success && response.data) {
      setAdmin(response.data.admin);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: response.error?.message };
  };

  const logout = async () => {
    await api.adminLogout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, admin, login, logout, setAdmin };
}

export function useDashboardStats() {
  return useApiCall<DashboardStats>(() => api.getDashboardStats(), []);
}

export function useAdminUsers(page = 1, limit = 10, query?: string) {
  return useApiCall<AdminUser[]>(
    async () => {
      const response = await api.getAdminUsers(page, limit, query);
      if (response.success && response.data) {
        return { success: true, data: response.data.users };
      }
      return response as { success: boolean; data?: AdminUser[]; error?: { message: string } };
    },
    [page, limit, query]
  );
}

export function useAdminProducts(page = 1, limit = 10, category?: string) {
  return useApiCall<Product[]>(
    async () => {
      const response = await api.getAdminProducts(page, limit, category);
      if (response.success && response.data) {
        return { success: true, data: response.data.products };
      }
      return response as { success: boolean; data?: Product[]; error?: { message: string } };
    },
    [page, limit, category]
  );
}
