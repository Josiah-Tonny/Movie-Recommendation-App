import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Star } from 'lucide-react'; // Keep Star import for explicit use

/**
 * MovieCard Component
 * 
 * This component renders a card displaying movie information including:
 * - Movie poster image
 * - Title
 * - Rating with star icon
 * - Release date
 * - Overview/description
 * - Cast (if provided)
 */

interface MovieCardProps {
  id: number;          // Unique identifier for the movie
  title: string;       // Title of the movie
  posterPath: string | null;  // Path to the movie poster image
  overview: string;    // Brief description of the movie
  rating: number;      // Movie rating (out of 10)
  releaseDate?: string; // Release date of the movie (optional)
  cast?: { name: string; character?: string }[]; // Cast members
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  overview,
  rating,
  releaseDate,
  cast,
}) => {
  // Handle missing poster images
  const posterUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-poster.jpg';

  // Get rating color based on the score
  const getRatingColor = (score: number) => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Link
      to={`/movie/${id}`}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-xl relative group"
    >
      {/* Rating badge - positioned absolutely on top of the poster */}
      <div className={`absolute top-3 right-3 ${getRatingColor(rating)} text-white font-bold rounded-full h-10 w-10 flex items-center justify-center z-10 group-hover:scale-110 transition-transform`}>
        {rating.toFixed(1)}
      </div>
      
      {/* Movie poster image with overlay gradient */}
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-96 object-cover transition-transform group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity" />
      </div>
      
      <div className="p-4">
        {/* Header section with title */}
        <h3 className="text-xl font-bold truncate mb-2">{title}</h3>
        
        {/* Release date display */}
        {releaseDate && (
          <div className="text-gray-300 text-sm mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1 inline text-gray-400" />
            <span>{releaseDate}</span>
          </div>
        )}
        
        {/* Cast display (if provided) */}
        {cast && cast.length > 0 && (
          <div className="text-gray-300 text-sm mb-2">
            <div className="flex items-center text-blue-400 mb-1">
              <User className="w-4 h-4 mr-1" />
              <span className="font-medium">Cast:</span>
            </div>
            <p className="text-gray-400 line-clamp-1">
              {cast.slice(0, 3).map(actor => actor.name).join(', ')}
              {cast.length > 3 ? '...' : ''}
            </p>
          </div>
        )}
        
        {/* Movie overview with text truncation (3 lines max) */}
        <p className="text-gray-400 text-sm line-clamp-3">{overview}</p>
      </div>
      
      {/* View details button that appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
          View Details
        </div>
      </div>

      {/* Star rating display - explicitly using Star icon to fix the "unused import" error */}
      <div className="flex items-center absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
        <Star className="w-4 h-4 text-yellow-500 mr-1" />
        <span>{rating.toFixed(1)}/10</span>
      </div>
    </Link>
  );
};

export default MovieCard;