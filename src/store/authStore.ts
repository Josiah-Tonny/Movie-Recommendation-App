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

// Helper function to determine if we're in development
const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Mock user for development environment
const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  watchlist: [],
  favorites: []
};

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
      if (isDevelopment()) {
        // For development environment: mock signup
        console.log('Development mode: Using mock signup');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const token = 'mock-token-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', token);
        
        set({
          user: { ...MOCK_USER, email, name },
          token,
          isAuthenticated: true,
          loading: false,
          favorites: [],
          watchlist: []
        });
        return;
      }
      
      // For production environment: use Netlify Functions
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
      console.log('Sign up failed:', error);
      set({ loading: false, error: (error as Error).message });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (isDevelopment()) {
        // For development environment: mock login
        console.log('Development mode: Using mock login');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Simple validation (you can adjust this as needed)
        if (email !== 'demo@example.com') {
          throw new Error('Invalid credentials');
        }
        
        const token = 'mock-token-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', token);
        
        set({
          user: { ...MOCK_USER, email },
          token,
          isAuthenticated: true,
          loading: false,
          favorites: [],
          watchlist: []
        });
        return;
      }
      
      // For production: use Netlify Functions
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
      console.log('Sign in failed:', error);
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
    
    // For simplicity, assume token is valid
    if (isDevelopment()) {
      set({ 
        isAuthenticated: true,
        user: MOCK_USER
      });
    } else {
      set({ isAuthenticated: true });
    }
  },

  checkAuthentication: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    if (isDevelopment()) {
      // In development, use mock user
      set({ 
        isAuthenticated: true,
        user: MOCK_USER
      });
    } else {
      // In production, you would validate the token with your backend
      // For now, just set as authenticated if token exists
      set({ isAuthenticated: true });
    }
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