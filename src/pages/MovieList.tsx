import React, { useEffect, useState } from 'react';
import { useMovieStore } from '../store/movieStore';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { Loader2 } from 'lucide-react';
import GenreList from '../components/GenreList';

/**
 * MovieList Component
 * 
 * This component displays either a list of movies or TV series depending on the 'type' prop.
 * 
 * How it works:
 * 1. It fetches movies data from the movie store when the component mounts
 * 2. It shows a loading spinner while data is being fetched
 * 3. It filters the fetched movies based on the 'type' prop (movie or tv)
 * 4. It displays the filtered movies in a responsive grid using MovieCard components
 * 5. It includes a SearchBar for searching movies and Pagination for navigating between pages
 */

// Define the props that MovieList component accepts
interface MovieListProps {
  type: 'movie' | 'tv'; // Can be either 'movie' or 'tv'
}

const MovieList: React.FC<MovieListProps> = ({ type }) => {
  // Get movies data and functions from our global store
  const { movies, loading, fetchMovies, fetchMoviesByGenre } = useMovieStore();
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  // Fetch movies when component mounts (runs only once)
  useEffect(() => {
    if (selectedGenreId) {
      // Fetch movies by genre
      fetchMoviesByGenre(selectedGenreId, 1);
    } else {
      // Fetch all movies
      fetchMovies(1);
    }
  }, [fetchMovies, fetchMoviesByGenre, selectedGenreId]); // Dependency array includes fetchMovies to avoid lint warnings

  // Show loading spinner while waiting for data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Filter movies based on the 'type' prop
  // Movies don't have 'name' property but TV shows do
  // Update the filtering logic to handle potential undefined name property
  const filteredMovies = type === 'movie' 
    ? movies.filter(m => !m.name && m.title) // For movies: keep items with title but no name
    : movies.filter(m => m.name); // For TV shows: keep items with a name property

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-8">
        {type === 'movie' ? 'Movies' : 'TV Series'}
      </h1>
      
      {/* Search functionality */}
      <SearchBar />
      
      {/* Genre filter */}
      <GenreList onSelectGenre={setSelectedGenreId} selectedGenreId={selectedGenreId} />
      
      {/* Movie grid - responsive layout with different columns based on screen size */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id} // React needs a unique key for list items
            id={movie.id}
            title={movie.title || movie.name || ''} // Use title for movies, name for TV shows
            posterPath={movie.poster_path === null ? '' : movie.poster_path}
            overview={movie.overview}
            rating={movie.vote_average || 0} // Add default value
          />
        ))}
      </div>
      
      {/* Pagination for navigating between pages of results */}
      <Pagination />
    </div>
  );
};

export default MovieList;