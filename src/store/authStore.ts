import { create } from 'zustand';
import { User } from '../types/user';

// Updated authStore.ts to work with MongoDB
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  favorites: [],
  watchlist: [],
  
  setUser: (userData) => {
    set({
      user: userData.user,
      token: userData.token,
      isAuthenticated: true,
      loading: false,
      error: null,
      favorites: userData.user.favorites || [],
      watchlist: userData.user.watchlist || []
    });
  },
  
  logoutUser: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      favorites: [],
      watchlist: []
    });
  },
  
  checkAuthentication: async () => {
    try {
      set({ loading: true });
      
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        set({ loading: false });
        return false;
      }
      
      // Validate token with MongoDB backend
      const response = await fetch('http://localhost:5000/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        set({ loading: false });
        return false;
      }
      
      const data = await response.json();
      
      if (data.user) {
        set({
          user: data.user,
          token,
          isAuthenticated: true,
          favorites: data.user.favorites || [],
          watchlist: data.user.watchlist || []
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      // Connect to your MongoDB backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Update state with user data
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        favorites: data.user.favorites || [],
        watchlist: data.user.watchlist || []
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Authentication failed. Please check your credentials.'
      });
    } finally {
      set({ loading: false });
    }
  },
  
  signUp: async (email, password, name) => {
    try {
      set({ loading: true, error: null });
      
      // Connect to MongoDB backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Update state with user data
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        favorites: data.user.favorites || [],
        watchlist: data.user.watchlist || []
      });
    } catch (error) {
      console.error('Sign up failed:', error);
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Registration failed. Please try again.'
      });
    } finally {
      set({ loading: false });
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Reset state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        favorites: [],
        watchlist: []
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Sign out failed. Please try again.'
      });
    } finally {
      set({ loading: false });
    }
  },
  
  // Add to favorites implementation with MongoDB sync
  addToFavorites: (id) => {
    set(state => {
      const updatedFavorites = state.favorites.includes(id)
        ? state.favorites.filter(movieId => movieId !== id)
        : [...state.favorites, id];
      
      // If user is logged in, sync with MongoDB backend
      if (state.isAuthenticated && state.token) {
        fetch('http://localhost:5000/api/users/update-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({ favorites: updatedFavorites })
        }).catch(err => console.error('Failed to sync favorites:', err));
      }
      
      return {
        ...state,
        favorites: updatedFavorites
      };
    });
  },
  
  // Add to watchlist implementation with MongoDB sync
  addToWatchlist: (id) => {
    set(state => {
      const updatedWatchlist = state.watchlist.includes(id)
        ? state.watchlist.filter(movieId => movieId !== id)
        : [...state.watchlist, id];
      
      // If user is logged in, sync with MongoDB backend
      if (state.isAuthenticated && state.token) {
        fetch('http://localhost:5000/api/users/update-watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({ watchlist: updatedWatchlist })
        }).catch(err => console.error('Failed to sync watchlist:', err));
      }
      
      return {
        ...state,
        watchlist: updatedWatchlist
      };
    });
  }
}));

// Type definitions moved to the bottom to avoid unused variable warnings
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  favorites: number[];
  watchlist: number[];
  
  // Methods
  setUser: (userData: { user: User, token: string }) => void;
  logoutUser: () => void;
  checkAuthentication: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  addToFavorites: (id: number) => void;
  addToWatchlist: (id: number) => void;
}