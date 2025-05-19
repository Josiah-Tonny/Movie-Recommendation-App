import React, { useEffect, useState } from 'react';
import { useMovieStore } from '../store/movieStore';
import MovieCard from '../components/MovieCard';
import { Loader2, CalendarClock } from 'lucide-react';

/**
 * Latest Movies Component
 * 
 * This component displays the most recently released movies and upcoming movies from TMDB.
 * 
 * How it works:
 * 1. It fetches current movies and upcoming movies from the API
 * 2. Shows a loading spinner while data is being fetched
 * 3. Sorts the movies by release date (newest first)
 * 4. Displays the movies in a responsive grid layout
 * 5. Shows a separate section for upcoming/coming soon movies
 */
const Latest: React.FC = () => {
  // Get movie data and functions from our central store
  const { movies, loading, fetchMovies } = useMovieStore();
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  // Fetch current movies when the component first loads
  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // Fetch upcoming movies
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoadingUpcoming(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${import.meta.env.VITE_TMDB_API_KEY || '3e837d7bb1300eed1f65b45498237f6d'}&language=en-US&page=1`
        );
        const data = await response.json();
        setUpcomingMovies(data.results || []);
      } catch (error) {
        console.error('Error fetching upcoming movies:', error);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    fetchUpcoming();
  }, []);

  // Show loading spinner while waiting for movies to load
  if (loading && loadingUpcoming) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Format date to display in a user-friendly format
  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'Release date unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Determine if a movie is newly released (within the last 30 days)
  const isNewRelease = (dateString: string) => {
    if (!dateString) return false;
    const releaseDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return releaseDate >= thirtyDaysAgo && releaseDate <= today;
  };
  
  // Create a sorted copy of the current movies array by release date (newest first)
  const latestMovies = [...movies].sort((a, b) => {
    // Handle different date field names (movies use release_date, TV shows use first_air_date)
    const releaseDateA = new Date(a.release_date || a.first_air_date);
    const releaseDateB = new Date(b.release_date || b.first_air_date);
    
    // Sort in descending order (newest first)
    return releaseDateB.getTime() - releaseDateA.getTime();
  }).filter(movie => {
    const releaseDate = new Date(movie.release_date || movie.first_air_date);
    const today = new Date();
    return releaseDate <= today; // Only show movies that have been released
  });

  // Sort upcoming movies by release date (soonest first)
  const sortedUpcomingMovies = [...upcomingMovies].sort((a, b) => {
    const releaseDateA = new Date(a.release_date || a.first_air_date);
    const releaseDateB = new Date(b.release_date || b.first_air_date);
    return releaseDateA.getTime() - releaseDateB.getTime();
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Latest Releases Section */}
      <h1 className="text-3xl font-bold mb-8">Latest Releases</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {latestMovies.map((movie) => (
          <div key={movie.id} className="relative">
            {isNewRelease(movie.release_date || movie.first_air_date) && (
              <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-semibold z-10">
                NEW
              </span>
            )}
            <MovieCard
              id={movie.id}
              title={movie.title || movie.name}
              posterPath={movie.poster_path}
              overview={movie.overview}
              rating={movie.vote_average}
              releaseDate={formatReleaseDate(movie.release_date || movie.first_air_date)}
            />
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mb-8 border-t pt-8">
        <div className="flex items-center mb-6">
          <CalendarClock className="w-6 h-6 mr-2 text-yellow-500" />
          <h2 className="text-3xl font-bold">Coming Soon</h2>
        </div>
        
        {loadingUpcoming ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedUpcomingMovies.map((movie) => (
              <div key={movie.id} className="relative">
                <span className="absolute top-3 left-3 bg-yellow-600 text-white px-2 py-1 rounded-md text-sm font-semibold z-10">
                  {new Date(movie.release_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                    ? 'THIS WEEK' 
                    : 'COMING SOON'}
                </span>
                <MovieCard
                  id={movie.id}
                  title={movie.title || movie.name}
                  posterPath={movie.poster_path}
                  overview={movie.overview}
                  rating={movie.vote_average}
                  releaseDate={formatReleaseDate(movie.release_date || movie.first_air_date)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Latest;