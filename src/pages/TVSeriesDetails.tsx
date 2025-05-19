import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, Star, Calendar, Film, TrendingUp, AlertTriangle, 
  ArrowLeft, ChevronDown, ChevronUp, Heart, Bookmark, Share2, 
  X
} from 'lucide-react';
import { 
  getTVSeriesDetails, 
  getTVSeriesCredits, 
  getSimilarTVSeries, 
  getTVSeriesVideos, 
  getBestTrailer 
} from '../lib/tmdb';
import { useAuthStore } from '../store/authStore';
import VideoTrailer from '../components/VideoTrailer';
import { MovieResult, VideoResult, CastMember, TVSeason, Genre } from '../types/movie';

/**
 * TVSeriesDetails Component
 * 
 * This component displays detailed information about a specific TV series including:
 * - Series poster and backdrop
 * - Title and basic info (rating, seasons, first air date)
 * - Overview/description
 * - Status information (in production, ended, etc.)
 * - Seasons information with collapsible sections
 * - Cast members with images
 * - Similar series recommendations
 */
const TVSeriesDetails: React.FC = () => {
  // Get the TV series ID from the URL parameters
  const { id } = useParams<{ id: string }>();
  
  // State for expanded seasons
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  const { addToFavorites, addToWatchlist, favorites, watchlist } = useAuthStore();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // Fetch TV series details
  const {
    data: series, 
    isLoading: isLoadingSeries,
    error: seriesError
  } = useQuery({
    queryKey: ['tv', id],
    queryFn: () => getTVSeriesDetails(id!),
  });

  // Fetch TV series credits
  const {
    data: credits, 
    isLoading: isLoadingCredits
  } = useQuery({
    queryKey: ['tvCredits', id],
    queryFn: () => getTVSeriesCredits(id!),
    enabled: !!series, // Only fetch if we have the series data
  });

  // Fetch similar TV series
  const {
    data: similarSeries, 
    isLoading: isLoadingSimilar 
  } = useQuery({
    queryKey: ['tvSimilar', id],
    queryFn: () => getSimilarTVSeries(id!),
    enabled: !!series, // Only fetch if we have the series data
  });

  // Fetch videos data
  const {
    data: videoData,
    isLoading: isLoadingVideos
  } = useQuery({
    queryKey: ['tvVideos', id],
    queryFn: () => getTVSeriesVideos(id!),
    enabled: !!series,
  });

  // Set share URL and check if series is in favorites/watchlist
  useEffect(() => {
    if (series) {
      setShareUrl(window.location.href);
      
      if (favorites && Array.isArray(favorites)) {
        setIsFavorite(favorites.some(favId => favId === series.id));
      }
      
      if (watchlist && Array.isArray(watchlist)) {
        setIsWatchlisted(watchlist.some(watchId => watchId === series.id));
      }
    }
  }, [series, favorites, watchlist]);

  // Get best trailer
  const bestTrailer = series && videoData?.results ? 
    getBestTrailer(videoData.results) : null;

  // Handle share functionality
  const handleShare = async () => {
    if (!series) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${series.name} | MovieMate`,
          text: `Check out "${series.name}" on MovieMate!`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
        setShowShareDialog(true);
      }
    } else {
      setShowShareDialog(true);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
      setShowShareDialog(false);
    });
  };

  // Add to favorites handler
  const handleAddToFavorites = () => {
    if (series) {
      addToFavorites(series.id);
      setIsFavorite(!isFavorite);
    }
  };

  // Add to watchlist handler
  const handleAddToWatchlist = () => {
    if (series) {
      addToWatchlist(series.id);
      setIsWatchlisted(!isWatchlisted);
    }
  };

  // Loading state
  if (isLoadingSeries) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-300">Loading series details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (seriesError || !series) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-800 rounded-lg text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2">Failed to load series details</h2>
        <p className="text-gray-400 mb-6">
          {seriesError instanceof Error ? seriesError.message : "Couldn't find the TV series you're looking for."}
        </p>
        <Link to="/tv" className="inline-flex items-center text-blue-500 hover:text-blue-400">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to TV Series
        </Link>
      </div>
    );
  }

  // Toggle season expansion
  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonNumber)
        ? prev.filter(num => num !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  // Get status badge color based on series status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Returning Series':
        return 'bg-green-600';
      case 'Ended':
        return 'bg-red-600';
      case 'Canceled':
        return 'bg-red-700';
      case 'In Production':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Handle missing poster and backdrop images
  const posterUrl = series.poster_path 
    ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
    : '/placeholder-poster.jpg';
    
  const backdropUrl = series.backdrop_path
    ? `https://image.tmdb.org/t/p/original${series.backdrop_path}`
    : null;

  return (
    <div>
      {/* Hero section with backdrop */}
      {backdropUrl && (
        <div className="relative h-[40vh] md:h-[50vh] -mx-4 mb-8">
          <div className="absolute inset-0">
            <img 
              src={backdropUrl}
              alt={series.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{series.name}</h1>
              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm mb-4 ${getStatusColor(series.status)}`}>
                {series.status}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* If no backdrop, show title here */}
        {!backdropUrl && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{series.name}</h1>
            <div className={`inline-block px-3 py-1 rounded-full text-white text-sm mb-4 ${getStatusColor(series.status)}`}>
              {series.status}
            </div>
          </div>
        )}
      
        {/* Main content layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Poster and quick stats */}
          <div className="md:w-1/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <img
                src={posterUrl}
                alt={series.name}
                className="w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                }}
              />
              
              {/* Action buttons */}
              <div className="flex justify-around p-4 border-t border-gray-700">
                <button 
                  className={`flex flex-col items-center ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                  onClick={handleAddToFavorites}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-6 h-6 mb-1 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="text-xs">{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
                <button 
                  className={`flex flex-col items-center ${isWatchlisted ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
                  onClick={handleAddToWatchlist}
                  aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Bookmark className={`w-6 h-6 mb-1 ${isWatchlisted ? 'fill-current' : ''}`} />
                  <span className="text-xs">{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                </button>
                <button 
                  className="flex flex-col items-center text-gray-400 hover:text-green-500 transition-colors"
                  onClick={handleShare}
                  aria-label="Share this TV series"
                >
                  <Share2 className="w-6 h-6 mb-1" />
                  <span className="text-xs">Share</span>
                </button>
              </div>
              
              {/* Share options popup */}
              {showShareDialog && (
                <div className="bg-gray-700 rounded-lg p-4 mx-4 mb-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Share this series</h4>
                    <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">Copy Link</span>
                  </button>
                </div>
              )}
              
              {/* Key stats */}
              <div className="p-4 space-y-3">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rating</span>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="font-medium">{series.vote_average?.toFixed(1)}/10</span>
                    <span className="text-gray-400 text-sm ml-1">({series.vote_count} votes)</span>
                  </div>
                </div>
                
                {/* First Air Date */}
                {series.first_air_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">First Aired</span>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-1 text-blue-400" />
                      <span>{new Date(series.first_air_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                )}
                
                {/* Season Count */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Seasons</span>
                  <div className="flex items-center">
                    <Film className="w-5 h-5 mr-1 text-purple-400" />
                    <span>{series.number_of_seasons}</span>
                  </div>
                </div>
                
                {/* Episode Count */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Episodes</span>
                  <span>{series.number_of_episodes}</span>
                </div>
                
                {/* Popularity */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Popularity</span>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-1 text-green-400" />
                    <span>{Math.round(series.popularity)}</span>
                  </div>
                </div>
                
                {/* Genres */}
                {series.genres && series.genres.length > 0 && (
                  <div className="pt-2">
                    <span className="text-gray-300 block mb-2">Genres</span>
                    <div className="flex flex-wrap gap-2">
                      {series.genres.map((genre: Genre) => (
                        <span key={genre.id} className="bg-gray-700 text-sm px-2 py-1 rounded">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Overview, seasons, cast */}
          <div className="md:w-2/3">
            {/* Overview section */} 
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              {bestTrailer && (
                <div className="mb-6">
                  <VideoTrailer
                    videoKey={bestTrailer.key}
                    title={bestTrailer.name}
                    type={bestTrailer.type}
                    isOfficial={bestTrailer.official}
                    className="shadow-lg mb-3"
                  />
                </div>
              )}
              <p className="text-gray-300 leading-relaxed">
                {series.overview || "No overview available for this TV series."}
              </p>
            </div>

            {/* Videos section */}
            {videoData && videoData.results && videoData.results.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Videos</h2>
                
                {isLoadingVideos ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoData.results
                      .filter((video: VideoResult) => video.site === 'YouTube')
                      .slice(0, 4)
                      .map((video: VideoResult) => (
                        <VideoTrailer
                          key={video.id}
                          videoKey={video.key}
                          title={video.name}
                          type={video.type}
                          isOfficial={video.official}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Seasons section */}
            {series.seasons && series.seasons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Seasons</h2>
                <div className="space-y-4">
                  {series.seasons
                    .filter((season: TVSeason) => season.season_number > 0) // Filter out specials (season 0)
                    .map((season: TVSeason) => (
                    <div key={season.id} className="bg-gray-800 rounded-lg overflow-hidden">
                      {/* Season header - always visible */}
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => toggleSeason(season.season_number)}
                      >
                        <div className="flex items-start">
                          {season.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w200${season.poster_path}`} 
                              alt={`Season ${season.season_number}`}
                              className="w-12 h-18 object-cover rounded mr-4"
                            />
                          ) : (
                            <div className="w-12 h-18 bg-gray-700 rounded mr-4 flex items-center justify-center">
                              <Film className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold">{season.name}</h3>
                            <p className="text-sm text-gray-400">
                              {season.episode_count} Episode{season.episode_count !== 1 ? 's' : ''}
                              {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Expand/collapse icon */}
                        {expandedSeasons.includes(season.season_number) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Season details - only visible when expanded */}
                      {expandedSeasons.includes(season.season_number) && (
                        <div className="p-4 pt-0 border-t border-gray-700">
                          <p className="text-gray-300 text-sm mb-3">
                            {season.overview || `No overview available for ${season.name}.`}
                          </p>
                          {season.air_date && (
                            <p className="text-gray-400 text-sm">
                              Air date: {new Date(season.air_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast section */}
            {credits?.cast && credits.cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                {isLoadingCredits ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {credits?.cast.map((actor: CastMember) => (
                      <div key={actor.id} className="text-center">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-40 object-cover rounded-lg mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-person.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-40 rounded-lg bg-gray-700 flex items-center justify-center mb-2">
                            <span className="text-2xl">{actor.name.charAt(0)}</span>
                          </div>
                        )}
                        <p className="font-medium text-sm line-clamp-1">{actor.name}</p>
                        <p className="text-gray-400 text-xs line-clamp-1">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Similar series section */}
            {similarSeries?.results && similarSeries.results.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
                {isLoadingSimilar ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {similarSeries.results.slice(0, 4).map((show: MovieResult) => (
                      <Link
                        key={show.id} 
                        to={`/tv/${show.id}`}
                        className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                      >
                        {show.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                            alt={show.name}
                            className="w-full aspect-[2/3] object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center">
                            <Film className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        <div className="p-2">
                          <h3 className="font-medium text-sm line-clamp-1">{show.name}</h3>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            <span className="text-xs">{show.vote_average?.toFixed(1)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVSeriesDetails;