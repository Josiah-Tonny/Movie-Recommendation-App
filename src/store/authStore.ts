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
  checkAuthentication: () => Promise<void>;
  favorites: string[];
  watchlist: string[];
  addToFavorites: (movieId: string) => void;
  removeFromFavorites: (movieId: string) => void;
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
}

// Helper function to determine environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  favorites: [],
  watchlist: [],

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      if (isDevelopment) {
        // In development, use a local mock to avoid CORS
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const token = `dev-token-${Date.now()}`;
        localStorage.setItem('token', token);
        
        set({
          user: {
            id: `dev-user-${Date.now()}`,
            email,
            name,
            watchlist: [],
            favorites: []
          },
          token,
          isAuthenticated: true,
          loading: false,
          favorites: [],
          watchlist: []
        });
        return;
      }
      
      // In production, use the real API
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
        favorites: data.user.favorites || [],
        watchlist: data.user.watchlist || []
      });
    } catch (error) {
      // Don't log the full error - just the message
      set({ loading: false, error: (error as Error).message });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (isDevelopment) {
        // In development, use a local mock to avoid CORS
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const token = `dev-token-${Date.now()}`;
        localStorage.setItem('token', token);
        
        set({
          user: {
            id: `dev-user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            watchlist: [],
            favorites: []
          },
          token,
          isAuthenticated: true,
          loading: false,
          favorites: [],
          watchlist: []
        });
        return;
      }
      
      // In production, use the real API
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
        favorites: data.user.favorites || [],
        watchlist: data.user.watchlist || []
      });
    } catch (error) {
      // Don't log the full error - just the message
      set({ loading: false, error: (error as Error).message });
    }
  },

  signOut: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      favorites: [],
      watchlist: [] 
    });
  },

  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    set({ isAuthenticated: true });
  },

  checkAuthentication: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
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