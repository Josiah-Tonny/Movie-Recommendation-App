import React, { useEffect } from 'react';
import { useMovieStore } from '../store/movieStore';
import MovieCard from '../components/MovieCard';
import { Loader2 } from 'lucide-react';

/**
 * MostWatched Component
 * 
 * This component displays a list of movies sorted by their watch count (popularity).
 * 
 * How it works:
 * 1. It fetches movie data from the movie store on component mount
 * 2. Shows a loading spinner while data is being fetched
 * 3. Once data is loaded, it sorts movies by vote_count (highest first)
 * 4. Renders the sorted movies in a responsive grid layout
 */
const MostWatched: React.FC = () => {
  // Get movies, loading state, and fetch function from our global store
  const { movies, loading, fetchMovies } = useMovieStore();

  // Fetch movies when component mounts (page 1 only)
  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Create a sorted copy of movies by vote_count (most watched first)
  const sortedMovies = [...movies].sort((a, b) => b.vote_count - a.vote_count);

  // Render the movies list
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page heading */}
      <h1 className="text-3xl font-bold mb-8">Most Watched</h1>
      
      {/* Responsive grid layout for movie cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Map through each movie and create a card for it */}
        {sortedMovies.map((movie) => (
          // Some movies use name instead of title
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title || movie.name}
            posterPath={movie.poster_path}
            overview={movie.overview}
            rating={movie.vote_average}
          />
        ))}
      </div>
    </div>
  );
};

export default MostWatched;