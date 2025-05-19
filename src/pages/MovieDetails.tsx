import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, Star, Clock, Calendar, PlayCircle, Heart, Share2, 
  Bookmark, ExternalLink, Youtube, AlertCircle, X 
} from 'lucide-react';
import { getMovieDetails, getMovieCredits, getSimilarMovies, getMovieVideos, getBestTrailer } from '../lib/tmdb';
import { useAuthStore } from '../store/authStore';
import { MovieResult, VideoResult, Genre, CastMember, CrewMember } from '../types/movie';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import YouTubeErrorBoundary from '../components/YouTubeErrorBoundary';
import SafeYouTubeEmbed from '../components/SafeYouTubeEmbed';

/**
 * MovieDetails Component
 * 
 * This component displays detailed information about a specific movie.
 */
const MovieDetails: React.FC = () => {
  // Get the movie ID from the URL parameters
  const { id } = useParams<{ id: string }>();
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Get auth store functions for favorites and watchlist
  const { 
    favorites, watchlist, 
    addToFavorites, addToWatchlist 
  } = useAuthStore();
  
  // Track if movie is in favorites/watchlist
  const [isFavorite, setIsFavorite] = useState(favorites?.includes(Number(id)));
  const [isWatchlisted, setIsWatchlisted] = useState(watchlist?.includes(Number(id)));

  // Fetch movie details
  const { 
    data: movie, 
    isLoading: isLoadingMovie,
    error: movieError
  } = useQuery({
    queryKey: ['movieDetails', id],
    queryFn: () => getMovieDetails(id || ''),
    enabled: !!id
  });

  // Fetch movie credits
  const { 
    data: credits, 
    isLoading: isLoadingCredits 
  } = useQuery({
    queryKey: ['movieCredits', id],
    queryFn: () => getMovieCredits(id || ''),
    enabled: !!id
  });

  // Fetch similar movies
  const { 
    data: similarMovies, 
    isLoading: isLoadingSimilar 
  } = useQuery({
    queryKey: ['similarMovies', id],
    queryFn: () => getSimilarMovies(id || ''),
    enabled: !!id
  });

  // Fetch movie videos
  const { 
    data: videoData, 
    isLoading: isLoadingVideos 
  } = useQuery({
    queryKey: ['movieVideos', id],
    queryFn: () => getMovieVideos(id || ''),
    enabled: !!id
  });

  // Get the best trailer if available
  const bestTrailer = React.useMemo(() => {
    if (!videoData || !videoData.results) return null;
    return getBestTrailer(videoData.results);
  }, [videoData]);

  // Share handler
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Copy to clipboard handler
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
      setShowShareOptions(false);
    });
  };

  // Add to favorites handler
  const handleAddToFavorites = () => {
    if (movie) {
      addToFavorites(movie.id);
      setIsFavorite(!isFavorite);
    }
  };

  // Add to watchlist handler
  const handleAddToWatchlist = () => {
    if (movie) {
      addToWatchlist(movie.id);
      setIsWatchlisted(!isWatchlisted);
    }
  };

  // Show a loading skeleton while primary data is being fetched
  if (isLoadingMovie) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 h-[500px] bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="flex space-x-4 mb-4">
              <div className="h-6 bg-gray-700 rounded w-16"></div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-3"></div>
            <div className="flex flex-wrap gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (movieError || !movie) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-800 rounded-lg text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2">Failed to load movie details</h2>
        <p className="text-gray-400 mb-6">
          {movieError instanceof Error ? movieError.message : "Couldn't find the movie you're looking for."}
        </p>
        <Link
          to="/movies"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center"
        >
          <span className="mr-2">Browse Movies</span>
        </Link>
      </div>
    );
  }

  // Format the movie's runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format the movie's budget or revenue to a readable format
  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format the release date
  const formatReleaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate background style with poster image
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  // Handle missing poster images
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.jpg';

  // Get YouTube trailer if available
  const trailerVideo = movie.videos?.results?.find(
    (video: VideoResult) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <div className="mb-10">
      {/* Hero section with backdrop image */}
      <div 
        className="w-full h-[50vh] relative mb-8" 
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <div className="flex items-center bg-yellow-600 text-white px-2 py-1 rounded">
                  <Star className="w-4 h-4 mr-1" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatReleaseDate(movie.release_date)}</span>
                </div>
                {trailerVideo && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerVideo.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column with poster and info */}
          <div className="w-full md:w-1/3">
            <img 
              src={posterUrl}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl mb-6"
            />
            {/* Action buttons */}
            <div className="flex justify-around mb-6">
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
                aria-label="Share this movie"
              >
                <Share2 className="w-6 h-6 mb-1" />
                <span className="text-xs">Share</span>
              </button>
              {movie.homepage && (
                <a 
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Visit official website"
                >
                  <ExternalLink className="w-6 h-6 mb-1" />
                  <span className="text-xs">Website</span>
                </a>
              )}
            </div>
            
            {/* Share options popup */}
            {showShareOptions && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Share this movie</h4>
                  <button onClick={() => setShowShareOptions(false)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">Copy Link</span>
                </button>
              </div>
            )}

            {/* Movie info */}
            <h3 className="text-lg font-semibold mb-3">Movie Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Release Date:</span>
                <div>{formatReleaseDate(movie.release_date)}</div>
              </div>
              <div>
                <span className="text-gray-400">Genres:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.genres.map((genre: Genre) => (
                    <span key={genre.id} className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Budget:</span>
                <div>{formatCurrency(movie.budget)}</div>
              </div>
              <div>
                <span className="text-gray-400">Revenue:</span>
                <div>{formatCurrency(movie.revenue)}</div>
              </div>
              <div>
                <span className="text-gray-400">Original Language:</span>
                <div>{movie.original_language?.toUpperCase()}</div>
              </div>
              <div>
                <span className="text-gray-400">Production Companies:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {movie.production_companies?.map((company: ProductionCompany) => (
                    <span key={company.id} className="text-gray-300">
                      {company.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column with tabs: overview, cast, videos, similar */}
          <div className="md:w-2/3">
            {/* Tab navigation */}
            <Tabs defaultValue="overview" className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cast">Cast</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="similar">Similar</TabsTrigger>
              </TabsList>
              
              {/* Tab content */}
              <TabsContent value="overview">
                {/* Overview content */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Overview</h2>
                  <p className="text-gray-300 leading-relaxed mb-6">{movie.overview}</p>
                  
                  {/* Key crew members */}
                  <h3 className="text-xl font-semibold mb-3">Key Crew</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {movie.credits?.crew?.filter((person: CrewMember) => 
                      ['Director', 'Producer', 'Screenplay', 'Writer'].includes(person.job)
                    ).slice(0, 6).map((person: CrewMember) => (
                      <div key={`${person.id}-${person.job}`} className="bg-gray-800 p-3 rounded">
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-gray-400">{person.job}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Plot keywords */}
                  {movie.keywords?.keywords?.length > 0 && (
                    <>
                      <h3 className="text-xl font-semibold mb-3">Keywords</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {movie.keywords.keywords.map((keyword: {id: number, name: string}) => (
                          <span key={keyword.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                            {keyword.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="cast">
                {/* Cast content */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Cast</h2>
                  {isLoadingCredits ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {credits?.cast.map((actor: CastMember) => (
                        <div key={actor.id} className="text-center">
                          {actor.profile_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-48 object-cover object-center rounded-lg mb-2"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-person.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                              <span className="text-3xl font-light text-gray-500">{actor.name.charAt(0)}</span>
                            </div>
                          )}
                          <p className="font-medium truncate">{actor.name}</p>
                          <p className="text-sm text-gray-400 truncate">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="videos">
                {/* Videos content */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Videos</h2>
                  {isLoadingVideos ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : videoData?.results?.length ? (
                    <YouTubeErrorBoundary>
                      <div>
                        {/* Featured trailer (if available) */}
                        {bestTrailer && (
                          <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Featured Trailer</h3>
                            <SafeYouTubeEmbed
                              videoId={bestTrailer.key}
                              title={bestTrailer.name}
                              className="rounded-lg overflow-hidden"
                            />
                          </div>
                        )}
                        
                        {/* All videos */}
                        <h3 className="text-xl font-semibold mb-3">All Videos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {videoData.results
                            .filter((video: VideoResult) => video.site === 'YouTube')
                            .map((video: VideoResult) => (
                              <a
                                key={video.id}
                                href={`https://www.youtube.com/watch?v=${video.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105"
                              >
                                <div className="aspect-video relative">
                                  <img
                                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                    alt={video.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-20 transition-colors">
                                    <Youtube className="w-12 h-12 text-red-600" />
                                  </div>
                                </div>
                                <div className="p-3">
                                  <h4 className="font-medium truncate">{video.name}</h4>
                                  <p className="text-sm text-gray-400">{video.type}</p>
                                </div>
                              </a>
                            ))}
                        </div>
                      </div>
                    </YouTubeErrorBoundary>
                  ) : (
                    <p className="text-gray-400">No videos available for this movie.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="similar">
                {/* Similar movies content */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
                  {isLoadingSimilar ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : similarMovies?.results?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {similarMovies.results.slice(0, 10).map((movie: MovieResult) => (
                        <Link
                          to={`/movie/${movie.id}`}
                          key={movie.id}
                          className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105"
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              className="w-full aspect-[2/3] object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-60 bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}
                          <div className="p-2">
                            <h3 className="font-medium truncate">{movie.title}</h3>
                            <div className="flex items-center text-sm text-gray-400">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No similar movies found.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;

// Add this interface near the top of the file with other types
interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}