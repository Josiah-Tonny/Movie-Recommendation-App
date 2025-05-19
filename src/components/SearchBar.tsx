import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useMovieStore } from '../store/movieStore';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * SearchBar Component
 * 
 * This component renders a search form that allows users to search for movies.
 * It uses the useMovieStore hook to interact with the movie data store.
 */
const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the search query from URL if available
  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get('q') || '';
  
  // State to track what the user is typing in the search box
  const [query, setQuery] = useState(urlQuery);
  
  // Get the search and fetch functions from our movie data store
  const { searchForMovies, fetchMovies, setSearchParams } = useMovieStore();

  // Sync the query state with URL when location changes
  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setQuery(searchQuery);
    
    if (searchQuery && location.pathname === '/movies') {
      // If we have a search query and we're on movies page, perform search
      searchForMovies(searchQuery, 1, 50); // Get more results (50)
    }
  }, [location.search]);

  /**
   * Handles the form submission when user presses enter or clicks submit
   * @param e - The form submission event
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Update URL with search query
      navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
      
      // Store search parameters in the store
      setSearchParams({
        query: query.trim(),
        resultsPerPage: 50, // Request more results
        includeAdult: false
      });
      
      // If query exists, search for matching movies
      searchForMovies(query, 1, 50); // Get more results (50)
    } else {
      // If query is empty, clear the search and go to movies page
      navigate('/movies');
      fetchMovies(1, 40); // Fetch more movies (40)
    }
  };

  // Clear search query
  const clearSearch = () => {
    setQuery('');
    navigate('/movies');
    fetchMovies(1, 40);
  };

  return (
    // Form element that handles the search submission
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        {/* Search input field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update state when user types
          placeholder="Search for movies or TV shows..."
          className="w-full px-4 py-3 pl-10 pr-10 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search for movies or TV shows"
        />
        {/* Search icon positioned to the left of the input field */}
        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        
        {/* Clear button - show only when there's text */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Search tips */}
      <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-2">
        <span>Try searching by title, actor, director, or year</span>
        <span>•</span>
        <span>Include year for better results (e.g., "Jaws 1975")</span>
      </div>
    </form>
  );
};

export default SearchBar;