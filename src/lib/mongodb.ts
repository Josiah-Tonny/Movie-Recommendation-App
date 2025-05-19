import mongoose from 'mongoose';
import axios from 'axios';

// Define TypeScript interfaces for data models
interface IWatchlistItem {
  id: string;
  title: string;
  poster_path: string;
  media_type: string;
  date_added: Date;
}

interface IListItem {
  id: string;
  title: string;
  poster_path: string;
  media_type: string;
}

interface ICustomList {
  name: string;
  items: IListItem[];
}

interface IRecommendation {
  id: string;
  title: string;
  poster_path: string;
  media_type: string;
}

interface IUser {
  email: string;
  password: string;
  name?: string;
  watchlist: IWatchlistItem[];
  customLists: ICustomList[];
  recommendations: IRecommendation[];
  createdAt: Date;
}

// User Schema
const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  watchlist: [{
    id: String,
    title: String,
    poster_path: String,
    media_type: String,
    date_added: {
      type: Date,
      default: Date.now
    }
  }],
  customLists: [{
    name: String,
    items: [{
      id: String,
      title: String,
      poster_path: String,
      media_type: String
    }]
  }],
  recommendations: [{
    id: String,
    title: String,
    poster_path: String,
    media_type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create an axios instance for the backend API with better timeout defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to your Express server
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
  timeout: 30000 // Increase default timeout to 30 seconds
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  async register(email: string, password: string, name?: string) {
    try {
      console.log('Attempting to register user with:', { email, name });
      
      const response = await api.post('/auth/register', { email, password, name });
      if (!response.data) {
        throw new Error('No response from server');
      }
      
      // Only store authentication token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error: Error | unknown) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed');
      }
    }
  },

  async login(email: string, password: string) {
    try {
      console.log('Login attempt for:', email);
      console.time('Login request');
      
      // Remove timeout constraint to allow sufficient time for authentication
      const response = await api.post('/auth/login', { email, password });
      
      console.timeEnd('Login request');
      
      if (!response.data) {
        throw new Error('No response from server');
      }
      
      // Only store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      console.log('Login successful');
      return response.data;
    } catch (error: unknown) {
      console.error('Login error details:', error);
      
      if (axios.isCancel(error)) {
        throw new Error('Login request was canceled. Please try again.');
      } else if (axios.isAxiosError(error)) {
        if (error.response?.status === 0 || !error.response) {
          throw new Error('Cannot connect to server. Please check your internet connection.');
        } else if (error.response?.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  },

  async logout() {
    try {
      // JWT is stateless, so we don't actually need to call the server
      // Just remove the token from localStorage
      localStorage.removeItem('token');
      console.log('Logout successful');
      
      // We'll still try to call the server but won't wait for a response
      // This helps with any server-side cleanup but won't block the logout
      api.post('/auth/logout').catch(err => {
        // Just log this error but don't fail the logout
        console.log('Server logout notification failed:', err.message);
      });
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Logout error:', error);
      // Even if there's an error, we should still remove the token
      localStorage.removeItem('token');
      return { success: true };
    }
  },

  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      if (!response.data) {
        throw new Error('No response from server');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('Get user profile error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    }
  },

  async updateUserData(userData: Partial<IUser>) {
    try {
      const response = await api.put('/users/profile', userData);
      if (!response.data) {
        throw new Error('No response from server');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('Update user data error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update user data');
      }
    }
  },

  async requestPasswordReset(email: string) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (!response.data) {
        throw new Error('No response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to request password reset');
      }
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      if (!response.data) {
        throw new Error('No response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to reset password');
      }
    }
  }
};

// Create User model only if we're in a server environment
export const User = typeof window === 'undefined' 
  ? (mongoose.models.User || mongoose.model<IUser>('User', userSchema))
  : null;