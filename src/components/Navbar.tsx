import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, LogOut, TrendingUp, Clock, Play, Tv, Menu, X, User, Search, Bookmark, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/**
 * Navbar Component
 * 
 * This component handles the navigation bar at the top of the application.
 * It now restricts navigation links until a user is logged in.
 */
const Navbar: React.FC = () => {
  const { user, signOut, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Track scroll position for transparent to solid background effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // If user is not logged in and not on auth page, redirect to auth
  useEffect(() => {
    if (!isAuthenticated && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use the same URL structure as the main SearchBar component
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-800' 
          : 'bg-gradient-to-b from-gray-900 to-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center space-x-8">
            {/* App Logo and Brand Name */}
            <Link to={isAuthenticated ? "/" : "/auth"} className="flex items-center space-x-2">
              <Film className={`w-8 h-8 transition-colors duration-300 ${scrolled ? 'text-blue-500' : 'text-white'}`} />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                MovieMate
              </span>
            </Link>
            
            {/* Desktop Navigation Links - Only shown when authenticated */}
            {isAuthenticated && user && (
              <div className="hidden md:flex space-x-2">
                <NavLink to="/movies" isActive={isActive('/movies')} icon={<Play className="w-4 h-4" />} label="Movies" />
                <NavLink to="/tv" isActive={isActive('/tv')} icon={<Tv className="w-4 h-4" />} label="TV Series" />
                <NavLink to="/most-watched" isActive={isActive('/most-watched')} icon={<TrendingUp className="w-4 h-4" />} label="Most Watched" />
                <NavLink to="/latest" isActive={isActive('/latest')} icon={<Clock className="w-4 h-4" />} label="Latest" />
                <NavLink to="/my-lists" isActive={isActive('/my-lists')} icon={<Bookmark className="w-4 h-4" />} label="My Lists" />
              </div>
            )}
          </div>
          
          {/* Search, User Menu and Mobile Menu Toggle */}
          <div className="flex items-center space-x-2">
            {/* Desktop Search Form - Only shown when authenticated */}
            {isAuthenticated && user && (
              <>
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex relative mr-2 md:w-48 lg:w-64 animate-fadeIn">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies..."
                      className="py-1.5 px-4 pl-9 bg-gray-800/90 border border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 w-full"
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setSearchOpen(false);
                      }}
                    />
                    <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                    <button type="submit" className="hidden">Search</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-3 top-2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setSearchOpen(true)} 
                    className="hidden md:flex p-2 rounded-full hover:bg-gray-800/80 transition-colors"
                    aria-label="Open search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            
            {/* User Authentication Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-sm">
                  <span className="text-gray-400 mr-1">Welcome,</span>
                  <span className="font-medium truncate max-w-[120px] inline-block align-bottom">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-gray-800/80 transition-colors group"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
            
            {/* Mobile menu toggle button - Only shown when authenticated */}
            {isAuthenticated && user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-800/80 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu with animated transition - Only shown when authenticated */}
      {isAuthenticated && user && (
        <div 
          className={`md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="py-4 px-4 container mx-auto">
            <div className="space-y-1">
              <MobileNavLink to="/movies" icon={<Play className="w-5 h-5" />} label="Movies" onClick={() => setMobileMenuOpen(false)} isActive={isActive('/movies')} />
              <MobileNavLink to="/tv" icon={<Tv className="w-5 h-5" />} label="TV Series" onClick={() => setMobileMenuOpen(false)} isActive={isActive('/tv')} />
              <MobileNavLink to="/most-watched" icon={<TrendingUp className="w-5 h-5" />} label="Most Watched" onClick={() => setMobileMenuOpen(false)} isActive={isActive('/most-watched')} />
              <MobileNavLink to="/latest" icon={<Clock className="w-5 h-5" />} label="Latest" onClick={() => setMobileMenuOpen(false)} isActive={isActive('/latest')} />
              <MobileNavLink to="/my-lists" icon={<Bookmark className="w-5 h-5" />} label="My Lists" onClick={() => setMobileMenuOpen(false)} isActive={isActive('/my-lists')} />
              
              <div className="pt-3 border-t border-gray-800 mt-3">
                <form onSubmit={handleSearch} className="flex relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="py-2.5 px-4 pl-10 bg-gray-800/90 border border-gray-700 rounded-full text-sm focus:outline-none focus:border-blue-500 w-full"
                  />
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-2 text-gray-400 hover:text-white bg-transparent"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
              
              <div className="pt-3 border-t border-gray-800 mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400 mr-1">Signed in as</span>
                    <span className="font-medium text-white">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Navigation Link Component
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

// Mobile Navigation Link Component
interface MobileNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon, label, onClick, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      isActive 
        ? 'bg-blue-600/20 text-blue-400' 
        : 'hover:bg-gray-800/80 text-gray-300'
    }`}
    onClick={onClick}
  >
    <div className={`${isActive ? 'text-blue-400' : 'text-gray-400'}`}>{icon}</div>
    <span>{label}</span>
  </Link>
);

export default Navbar;