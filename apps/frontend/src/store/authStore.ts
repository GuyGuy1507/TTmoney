import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  currency: string;
  timezone: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, currency?: string, timezone?: string) => Promise<any>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user, token) => {
    set({ user, token, error: null });
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, currency = 'USD', timezone = 'UTC') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, currency, timezone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
