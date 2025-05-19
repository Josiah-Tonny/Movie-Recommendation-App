import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2, Mail, Lock, User, Info, CheckCircle2 } from 'lucide-react';
import { getPopularMovies } from '../lib/tmdb';

/**
 * Authentication Page Component
 * 
 * This component handles both sign-in and sign-up functionality.
 * How it works:
 * 1. The state 'isLogin' toggles between login and signup modes
 * 2. User enters email and password in the form
 * 3. On form submission, either signIn or signUp is called from the auth store
 * 4. Upon successful authentication, user is redirected to the home page
 * 5. Any errors during authentication are displayed to the user
 */
const Auth: React.FC = () => {
  // State for tracking if user is logging in or signing up
  const [isLogin, setIsLogin] = useState(true);
  
  // Form input states
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Background image states
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Authentication functions and states from our global store
  const { signIn, signUp, loading, error, isAuthenticated } = useAuthStore();
  
  // Navigation hook for redirecting after authentication
  const navigate = useNavigate();

  // Fetch popular movie backdrops for the background
  useEffect(() => {
    const fetchBackdrops = async () => {
      try {
        const { results } = await getPopularMovies();
        // Fix the filter to handle nullable backdrop_path properly
        const filteredResults = results.filter(movie => movie.backdrop_path !== null);
        const images = filteredResults.map(movie => 
          `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        );
        setBackgroundImages(images);
      } catch (err) {
        console.error('Failed to fetch movie backdrops:', err);
      }
    };
    
    fetchBackdrops();
  }, []);

  // Rotate through background images
  useEffect(() => {
    if (backgroundImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    
    return () => clearInterval(interval);
  }, [backgroundImages]);

  /**
   * Handle form submission for both login and signup
   * @param e - Form event
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call the appropriate auth function based on current mode
      if (isLogin) {
        await signIn(userEmail, userPassword);
      } else {
        await signUp(userEmail, userPassword, userName);
      }
      
      // Save to localStorage if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', userEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Navigate directly without delay or success message
      navigate('/');
      
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Reset form fields when switching modes
    setUserName('');
  };

  // Add this effect to redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background image carousel */}
      {backgroundImages.length > 0 && (
        <div className="absolute inset-0 w-full h-full">
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* Dark overlay to improve form readability */}
          <div className="absolute inset-0 bg-black bg-opacity-70" />
        </div>
      )}

      {/* Main content with elevated z-index */}
      <div className="relative z-10 flex w-full max-w-6xl">
        {/* Left side - Information about the system */}
        <div className="hidden md:block md:w-1/2 p-8">
          <div className="h-full flex flex-col justify-center space-y-6 text-white">
            <h1 className="text-4xl font-bold text-blue-400">Movie Explorer</h1>
            <p className="text-xl font-light">Your gateway to the world of cinema</p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Explore Thousands of Movies</h3>
                  <p className="text-gray-300">Access our vast collection of movies and TV shows from around the world.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Personalized Recommendations</h3>
                  <p className="text-gray-300">Get movie suggestions based on your viewing history and preferences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Create Your Watchlist</h3>
                  <p className="text-gray-300">Save movies to watch later and track what you've already seen.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Up-to-date Information</h3>
                  <p className="text-gray-300">Stay informed about new releases, trending movies, and exclusive content.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 flex items-center space-x-2 text-blue-300">
              <Info className="h-5 w-5" />
              <p>Join thousands of movie enthusiasts in our community today!</p>
            </div>
          </div>
        </div>
        
        {/* Right side - Authentication form */}
        <div className="w-full md:w-1/2 max-w-md mx-auto">
          <div className="bg-gray-900 bg-opacity-80 p-8 rounded-xl shadow-2xl border border-gray-800">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-white">
                {isLogin ? 'Welcome Back' : 'Join our Community'}
              </h2>
              <p className="mt-2 text-gray-400">
                {isLogin ? 'Sign in to access your account' : 'Create an account to get started'}
              </p>
            </div>
            
            {/* Authentication form */}
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              {/* Show name field only for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="pl-12 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              
              {/* Email input field with icon */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              {/* Password input field with icon */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              {/* Remember me checkbox - only for login */}
              {isLogin && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
              )}

              {/* Forgot password link - only for login */}
              {isLogin && (
                <div className="mt-4 text-right">
                  <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Display error message if authentication fails */}
              {error && (
                <div className="px-4 py-3 rounded-md bg-red-500 bg-opacity-20 border border-red-400 text-red-200 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 pt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Submit button (Sign In/Sign Up) */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200 shadow-lg shadow-blue-900/30"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Toggle between login and signup */}
            <div className="mt-6 text-center">
              <button
                onClick={toggleAuthMode}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;