import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { User, UserStats, Reward, Product, Distributor } from "@/types";
import { clearTokens, clearAdminTokens } from "@/lib/api";

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(name) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(name, value);
    } catch {
      // Safari private mode, quota exceeded, etc.
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  userStats: UserStats | null;
  rewards: Reward[];

  // Language
  language: "en" | "hi";

  // Products
  products: Product[];
  bestSellingProducts: Product[];

  // Distributors
  distributors: Distributor[];
  nearbyDistributors: Distributor[];

  // UI State
  isLoading: boolean;
  sidebarOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUserStats: (stats: UserStats) => void;
  setRewards: (rewards: Reward[]) => void;
  addReward: (reward: Reward) => void;
  setLanguage: (language: "en" | "hi") => void;
  setProducts: (products: Product[]) => void;
  setBestSellingProducts: (products: Product[]) => void;
  setDistributors: (distributors: Distributor[]) => void;
  setNearbyDistributors: (distributors: Distributor[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      userStats: null,
      rewards: [],
      language: "en",
      products: [],
      bestSellingProducts: [],
      distributors: [],
      nearbyDistributors: [],
      isLoading: false,
      sidebarOpen: true,

      // Actions
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setUserStats: (userStats) => set({ userStats }),
      setRewards: (rewards) => set({ rewards }),
      addReward: (reward) =>
        set((state) => ({ rewards: [reward, ...state.rewards] })),
      setLanguage: (language) => set({ language }),
      setProducts: (products) => set({ products }),
      setBestSellingProducts: (bestSellingProducts) =>
        set({ bestSellingProducts }),
      setDistributors: (distributors) => set({ distributors }),
      setNearbyDistributors: (nearbyDistributors) =>
        set({ nearbyDistributors }),
      setLoading: (isLoading) => set({ isLoading }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      logout: () => {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          userStats: null,
          rewards: [],
        });
      },
    }),
    {
      name: "agrio-store",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
      }),
    }
  )
);

// Admin Store
interface AdminState {
  admin: { id: string; name: string; email: string; role: string } | null;
  isAdminAuthenticated: boolean;
  setAdmin: (admin: AdminState["admin"]) => void;
  setAdminAuthenticated: (isAuthenticated: boolean) => void;
  adminLogout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      isAdminAuthenticated: false,
      setAdmin: (admin) => set({ admin }),
      setAdminAuthenticated: (isAdminAuthenticated) =>
        set({ isAdminAuthenticated }),
      adminLogout: () => {
        clearAdminTokens();
        set({ admin: null, isAdminAuthenticated: false });
      },
    }),
    {
      name: "agrio-admin-store",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);

