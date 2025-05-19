import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import { Loader2 } from 'lucide-react';
import { getPopularMovies } from '../lib/tmdb';

/**
 * MovieGrid Component
 * 
 * This component displays a responsive grid of movie cards.
 * 
 * How it works:
 * 1. It fetches movie data using the useMovieStore hook
 * 2. Shows a loading skeleton while fetching data
 * 3. Displays any error messages if something goes wrong
 * 4. Renders the movies in a responsive grid layout
 */
const MovieGrid: React.FC = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPopularMovies();
        setMovies(data.results);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch movies.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Skeleton loader during data fetch
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-[450px]">
              <div className="bg-gray-700 h-96 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-900/30 border border-red-700 rounded-lg">
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Movies</h3>
        <p className="text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Popular Movies</h2>
        <p className="text-gray-400">Showing {movies.length} movies</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            overview={movie.overview}
            rating={movie.vote_average}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;