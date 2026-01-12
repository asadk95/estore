import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading, error: null }),

      // Register new user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, message: response.message };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Login with API
      loginWithAPI: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, message: response.message };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Login (direct set - for compatibility)
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Clear cart on logout
        localStorage.removeItem('estore-cart');
      },

      // Fetch current user from API
      fetchUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await authAPI.getMe();
          set({ user: response.user });
        } catch (error) {
          // Token invalid, logout
          get().logout();
        }
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin';
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
