import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Auth from '../pages/Auth';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock getPopularMovies from tmdb.ts
vi.mock('../lib/tmdb', () => ({
  getPopularMovies: vi.fn().mockResolvedValue({
    results: [
      { id: 1, backdrop_path: '/backdrop1.jpg', title: 'Movie 1' },
      { id: 2, backdrop_path: '/backdrop2.jpg', title: 'Movie 2' },
    ]
  })
}));

// Mock router methods
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('Auth Components', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockUser = { id: '123', email: 'test@example.com' };
  
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
      setUser: vi.fn(),
      favorites: [],
      watchlist: [],
      addToFavorites: vi.fn(),
      addToWatchlist: vi.fn(),
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders Auth component with sign in form initially', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    // Should display login form elements
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\? Sign Up/i)).toBeInTheDocument();
  });

  it('switches to signup form when sign up link is clicked', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    // Click on sign up link
    fireEvent.click(screen.getByText(/Don't have an account\? Sign Up/i));
    
    // Should display sign up form elements
    expect(screen.getByText('Join our Community')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('submits sign in form with correct values', async () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check if signIn was called with correct values
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays error message when authentication fails', () => {
    // Mock auth error
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      error: 'Invalid email or password',
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
      setUser: vi.fn(),
      favorites: [],
      watchlist: [],
      addToFavorites: vi.fn(),
      addToWatchlist: vi.fn(),
    } as any);
    
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('redirects unauthenticated users in ProtectedRoute', () => {
    // Mock Navigate component
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      Navigate: (props: any) => {
        mockNavigate(props.to);
        return null;
      }
    }));
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    
    // Content should not be rendered and Navigate should be called
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Verify navigation redirect
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('renders protected content for authenticated users', () => {
    // Mock authenticated user
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
      setUser: vi.fn(),
      favorites: [],
      watchlist: [],
      addToFavorites: vi.fn(),
      addToWatchlist: vi.fn(),
    } as any);
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    
    // Content should be rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
