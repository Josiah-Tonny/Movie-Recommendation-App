import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Film, User } from 'lucide-react';

/**
 * TVSeriesCard Component
 * 
 * This component renders a card displaying TV series information including:
 * - TV show poster image
 * - Title
 * - Rating with star icon
 * - First air date
 * - Overview/description
 * - Cast (if provided)
 */

interface TVSeriesCardProps {
  id: number;
  name: string;
  posterPath: string | null;
  overview: string;
  rating: number;
  firstAirDate?: string;
  seasons?: number;
  cast?: { name: string; character?: string }[]; // Cast members
}

const TVSeriesCard: React.FC<TVSeriesCardProps> = ({
  id,
  name,
  posterPath,
  overview,
  rating,
  firstAirDate,
  seasons,
  cast,
}) => {
  // Handle missing poster images
  const posterUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-poster.jpg';
  
  // Format first air date for display
  const formattedDate = firstAirDate 
    ? new Date(firstAirDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      })
    : 'Unknown';

  // Check if series is new (aired in the last 30 days)
  const isNew = () => {
    if (!firstAirDate) return false;
    const airDate = new Date(firstAirDate);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return airDate >= thirtyDaysAgo;
  };
  
  return (
    <Link
      to={`/tv/${id}`}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-xl relative flex flex-col h-full group"
    >
      {/* TV Series poster image with responsive aspect ratio */}
      <div className="relative pt-[150%] overflow-hidden">
        <img
          src={posterUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
          }}
        />
        
        {/* Badge for new shows */}
        {isNew() && (
          <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            NEW
          </span>
        )}
        
        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full flex items-center">
          <Star className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity" />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {/* Series title */}
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{name}</h3>
        
        {/* Series metadata */}
        <div className="flex items-center text-sm text-gray-300 mb-2 flex-wrap gap-x-4 gap-y-1">
          {/* First air date */}
          {firstAirDate && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
          
          {/* Seasons count if available */}
          {seasons && (
            <div className="flex items-center">
              <Film className="w-3 h-3 mr-1" />
              <span>{seasons} Season{seasons !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Cast display (if provided) */}
        {cast && cast.length > 0 && (
          <div className="text-gray-300 text-sm mb-2">
            <div className="flex items-center text-blue-400 mb-1">
              <User className="w-3 h-3 mr-1" />
              <span className="font-medium">Cast:</span>
            </div>
            <p className="text-gray-400 line-clamp-1">
              {cast.slice(0, 3).map(actor => actor.name).join(', ')}
              {cast.length > 3 ? '...' : ''}
            </p>
          </div>
        )}
        
        {/* Series overview with text truncation */}
        <p className="text-gray-400 text-sm line-clamp-3 flex-grow">{overview || "No overview available."}</p>
        
        {/* View details button that appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TVSeriesCard;
