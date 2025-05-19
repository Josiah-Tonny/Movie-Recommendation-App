import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  watchlist?: string[];
  favorites?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  checkAuthStatus: () => void;
  checkAuthentication: () => Promise<void>; // Add this line
  favorites: string[];  // Add this line
  watchlist: string[];  // Add this line
  addToFavorites: (movieId: string) => void;  // Add this line
  removeFromFavorites: (movieId: string) => void;  // Add this line
  addToWatchlist: (movieId: string) => void;  // Add this line
  removeFromWatchlist: (movieId: string) => void;  // Add this line
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  favorites: [], // Initialize empty array
  watchlist: [], // Initialize empty array

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/.netlify/functions/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.log(' Sign up failed:', error);
      set({ loading: false, error: (error as Error).message });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/.netlify/functions/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.log(' Sign in failed:', error);
      set({ loading: false, error: error.message });
    }
  },

  signOut: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    // Here you could add JWT token verification
    // For now, just set as authenticated if token exists
    set({ isAuthenticated: true });
  },

  checkAuthentication: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    // In a real implementation you would validate the token with your backend
    set({ isAuthenticated: true });
  },

  addToFavorites: (movieId) => {
    set((state) => ({
      favorites: [...state.favorites, movieId]
    }));
  },
  
  removeFromFavorites: (movieId) => {
    set((state) => ({
      favorites: state.favorites.filter(id => id !== movieId)
    }));
  },
  
  addToWatchlist: (movieId) => {
    set((state) => ({
      watchlist: [...state.watchlist, movieId]
    }));
  },
  
  removeFromWatchlist: (movieId) => {
    set((state) => ({
      watchlist: state.watchlist.filter(id => id !== movieId)
    }));
  }
}));