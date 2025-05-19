import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { useMovieStore } from '../store/movieStore';
import MovieCard from './MovieCard';
import { MovieResult } from '../types/movie';

interface GenreModalProps {
  genreId: number;
  isOpen: boolean;
  onClose: () => void;
}

const GenreModal: React.FC<GenreModalProps> = ({ genreId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { fetchMoviesByGenre, movies, loading, error, genres } = useMovieStore();
  
  // Get genre name
  const genre = genres.find(g => g.id === genreId);
  
  // Fetch movies when modal opens
  useEffect(() => {
    if (isOpen && genreId) {
      fetchMoviesByGenre(genreId, 1);
    }
  }, [isOpen, genreId, fetchMoviesByGenre]);
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Handle "See All" click
  const handleSeeAll = () => {
    navigate(`/genre/${genreId}`);
    onClose();
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center overflow-y-auto p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">{genre?.name || 'Genre'} Movies</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-6rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => fetchMoviesByGenre(genreId, 1)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-6">{movies.length} movies found in this genre</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.slice(0, 10).map((movie: MovieResult) => (
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
              
              {movies.length > 10 && (
                <div className="text-center mt-8">
                  <p className="text-gray-400 mb-2">Showing 10 of {movies.length} movies</p>
                  <button 
                    onClick={handleSeeAll}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    See All {genre?.name} Movies
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenreModal;