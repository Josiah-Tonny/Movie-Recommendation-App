import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Loader2, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Calendar,
  PlayCircle
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { useMovieStore } from '../store/movieStore';

const GenrePage: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const { 
    movies, 
    genres,
    loading, 
    error,
    totalPages,
    fetchMoviesByGenre,
    fetchGenres
  } = useMovieStore();
  
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'release_date'>('popularity');
  const [isDescending, setIsDescending] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);

  // Get genre name from ID
  const genreName = genres.find(g => g.id === parseInt(genreId || '0'))?.name || 'Genre';

  // Fetch genres when component mounts
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Fetch movies when component mounts or when parameters change
  useEffect(() => {
    if (genreId) {
      fetchMoviesByGenre(parseInt(genreId), page, sortBy, isDescending);
    }
  }, [genreId, page, sortBy, isDescending, fetchMoviesByGenre]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'popularity' | 'rating' | 'release_date');
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setIsDescending(prev => !prev);
  };

  // Toggle detailed view for a movie
  const toggleMovieDetail = (movieId: number) => {
    setSelectedMovie(selectedMovie === movieId ? null : movieId);
  };

  // Function to format release date
  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg text-gray-300">Loading {genreName} movies...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button 
            onClick={() => fetchMoviesByGenre(parseInt(genreId || '0'), page)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{genreName} Movies</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="sort-by" className="mr-2 text-sm">Sort by:</label>
            <select 
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="release_date">Release Date</option>
            </select>
          </div>
          
          <button 
            onClick={toggleSortDirection}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded flex items-center"
            aria-label={isDescending ? "Sort ascending" : "Sort descending"}
          >
            <Filter className="w-4 h-4 mr-1" />
            {isDescending ? 'Desc' : 'Asc'}
          </button>
          
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              aria-label="Grid view"
            >
              <i className="fas fa-th mr-1"></i>
              Grid
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              aria-label="Detailed view"
            >
              <i className="fas fa-list mr-1"></i>
              Detailed
            </button>
          </div>
        </div>
      </div>
      
      {movies.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-10 text-center">
          <p className="text-gray-400">No {genreName.toLowerCase()} movies found.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-6">Showing page {page} of {totalPages} • {movies.length} movies found</p>
          
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title || movie.name || ''}
                  posterPath={movie.poster_path || ''}
                  overview={movie.overview}
                  rating={movie.vote_average || 0}
                  releaseDate={movie.release_date || movie.first_air_date || ''}
                />
              ))}
            </div>
          )}
          
          {/* Detailed View */}
          {viewMode === 'detailed' && (
            <div className="space-y-4">
              {movies.map((movie) => (
                <div 
                  key={movie.id}
                  className="bg-gray-800 rounded-lg overflow-hidden transition-all"
                >
                  {/* Main row - always visible */}
                  <div className="flex">
                    {/* Poster thumbnail */}
                    <div className="w-24 sm:w-36">
                      <Link to={`/movie/${movie.id}`}>
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                              : '/placeholder-poster.jpg'
                          }
                          alt={movie.title || movie.name || 'Movie poster'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    
                    {/* Movie info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <Link to={`/movie/${movie.id}`} className="hover:text-blue-400">
                          <h2 className="font-bold text-lg sm:text-xl">
                            {movie.title || movie.name}
                          </h2>
                        </Link>
                        
                        {/* Rating and release date */}
                        <div className="flex items-center text-sm text-gray-300 mt-1 flex-wrap gap-x-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>{movie.vote_average.toFixed(1)}/10</span>
                          </div>
                          {movie.release_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatReleaseDate(movie.release_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-gray-400 max-w-md line-clamp-1">
                          {movie.overview || "No overview available"}
                        </div>
                        
                        <button
                          onClick={() => toggleMovieDetail(movie.id)}
                          className="ml-2 p-1 rounded-full bg-gray-700 hover:bg-blue-700 transition-colors"
                          aria-label={selectedMovie === movie.id ? "Hide details" : "Show details"}
                        >
                          {selectedMovie === movie.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details section - visible when expanded */}
                  {selectedMovie === movie.id && (
                    <div className="border-t border-gray-700 p-4">
                      {movie.backdrop_path && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
                            alt={`Backdrop for ${movie.title || movie.name}`}
                            className="w-full"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      {/* Overview */}
                      <div className="mb-4">
                        <h3 className="font-medium text-lg mb-2">Overview</h3>
                        <p className="text-gray-300">
                          {movie.overview || "No overview available for this movie."}
                        </p>
                      </div>
                      
                      {/* Genre tags and popularity */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genre_ids.map(genreId => {
                          const genre = genres.find(g => g.id === genreId);
                          return genre ? (
                            <Link 
                              key={genre.id} 
                              to={`/genre/${genre.id}`}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                            >
                              {genre.name}
                            </Link>
                          ) : null;
                        })}
                        
                        <div className="ml-auto px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                          Popularity: {Math.round(movie.popularity)}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center transition-colors"
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination component at the bottom */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {/* Page numbers - show current, first, last, and nearby pages */}
              <div className="hidden sm:flex gap-1">
                {page > 1 && <button onClick={() => handlePageChange(1)} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700">1</button>}
                
                {page > 3 && <span className="px-3 py-2">...</span>}
                
                {page > 2 && <button onClick={() => handlePageChange(page - 1)} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700">{page - 1}</button>}
                
                <button className="px-3 py-2 rounded-md bg-blue-600 text-white">{page}</button>
                
                {page < totalPages - 1 && <button onClick={() => handlePageChange(page + 1)} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700">{page + 1}</button>}
                
                {page < totalPages - 2 && <span className="px-3 py-2">...</span>}
                
                {page < totalPages && <button onClick={() => handlePageChange(totalPages)} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700">{totalPages}</button>}
              </div>
              
              {/* Mobile pagination - just show current/total */}
              <span className="px-4 py-2 bg-gray-800 rounded-md sm:hidden">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Genre navigation */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <h2 className="text-xl font-bold mb-4">Other Genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}`}
              className={`px-4 py-2 rounded-full transition-colors ${
                parseInt(genreId || '0') === genre.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenrePage;