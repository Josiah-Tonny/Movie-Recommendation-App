import React, { useEffect, useState } from 'react';
import { useTVSeriesStore } from '../store/tvSeriesStore';
import TVSeriesGrid from '../components/TVSeriesGrid';
import { Search, Loader2, Filter, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import axios from 'axios';
import Button from '../components/ui/Button';

/**
 * TVSeriesPage Component
 * 
 * This component serves as the main page for browsing TV series.
 * It includes:
 * - Category selection (popular, top rated, on air)
 * - Search functionality with debouncing
 * - TV series grid display
 * - Pagination
 */
const TVSeriesPage: React.FC = () => {
  const { 
    fetchSeries, 
    searchForSeries, 
    currentCategory,
    currentPage,
    totalPages,
    searchQuery,
    loading
  } = useTVSeriesStore();
  
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  // Load TV series on initial render
  useEffect(() => {
    if (!searchQuery) {
      fetchSeries('popular');
    }
  }, [fetchSeries, searchQuery]);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/genre/tv/list',
          {
            params: {
              api_key: import.meta.env.VITE_TMDB_API_KEY
            }
          }
        );
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Failed to fetch TV genres', error);
      }
    };
    
    fetchGenres();
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    if (debouncedSearch) {
      searchForSeries(debouncedSearch);
    } else if (search === '' && searchQuery) {
      // Reset to current category when search is cleared
      fetchSeries(currentCategory);
    }
  }, [debouncedSearch, fetchSeries, search, searchForSeries, searchQuery, currentCategory]);

  // Handle category change
  const handleCategoryChange = (category: 'popular' | 'top_rated' | 'on_air') => {
    setSearch(''); // Clear search when changing categories
    fetchSeries(category, 1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (searchQuery) {
      searchForSeries(searchQuery, newPage);
    } else {
      fetchSeries(currentCategory, newPage);
    }
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get the human-readable category name
  const getCategoryName = () => {
    switch (currentCategory) {
      case 'popular': return 'Popular Series';
      case 'top_rated': return 'Top Rated Series';
      case 'on_air': return 'Currently Airing';
      default: return 'TV Series';
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearch('');
    fetchSeries(currentCategory);
  };

  // Handle genre change
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedGenre(value ? parseInt(value) : null);
  };

  // Refetch series when selected genre changes
  useEffect(() => {
    if (selectedGenre) {
      // Use the existing category but update with new genre filter
      fetchSeries(currentCategory, 1);
    }
  }, [selectedGenre, currentCategory, fetchSeries]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header with title and search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {searchQuery ? `Search: ${searchQuery}` : getCategoryName()}
        </h1>
        
        {/* Search input */}
        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search TV series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          
          {/* Show clear button when search has text */}
          {search && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Category filters */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-400 w-5 h-5" />
          <span className="text-gray-300">Filter by:</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={currentCategory === 'popular' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleCategoryChange('popular')}
          >
            Popular
          </Button>

          <Button 
            variant={currentCategory === 'top_rated' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleCategoryChange('top_rated')}
          >
            Top Rated
          </Button>

          <Button 
            variant={currentCategory === 'on_air' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleCategoryChange('on_air')}
          >
            Currently Airing
          </Button>
        </div>
        
        {/* Genre filter dropdown */}
        <div className="mb-6">
          <label htmlFor="genre-filter" className="block text-sm text-gray-400 mb-2">Filter by Genre:</label>
          <select
            id="genre-filter"
            value={selectedGenre || ''}
            onChange={handleGenreChange}
            className="w-full sm:w-auto px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* TV Series Grid */}
      <TVSeriesGrid />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 mb-6 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            
            <div className="px-4 py-2 bg-gray-800 rounded-md text-center min-w-[100px]">
              {loading ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <span>
                  Page <span className="font-bold">{currentPage}</span> of {totalPages}
                </span>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TVSeriesPage;
