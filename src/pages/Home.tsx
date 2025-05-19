import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import SearchBar from '../components/SearchBar';
import { useMovieStore } from '../store/movieStore';
import { useAuthStore } from '../store/authStore';
import {
  ChevronRight,
  Loader2,
  Clock,
  Calendar,
  Star,
  Film,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getMovieGenres } from '../lib/tmdb';
import GenreModal from '../components/GenreModal';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids: number[];
}

interface Genre {
  id: number;
  name: string;
}

interface CategoryDefinition {
  title: string;
  filter: (movie: MediaItem) => boolean;
  icon: React.ReactNode;
  link: string;
}

// Define SliderSettings interface
interface SliderSettings {
  dots: boolean;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slidesToScroll: number;
  autoplay: boolean;
  autoplaySpeed: number;
  pauseOnHover: boolean;
  arrows: boolean;
  dotsClass: string;
  accessibility: boolean;
  fade: boolean;
  responsive: {
    breakpoint: number;
    settings: {
      arrows: boolean;
    }
  }[];
}

const carouselSettings: SliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: true,
  arrows: true,
  dotsClass: 'slick-dots custom-dots',
  accessibility: true,
  fade: true,
  responsive: [
    {
      breakpoint: 640,
      settings: {
        arrows: false,
      }
    }
  ]
};

// Create a custom SliderComponent to avoid type issues:
const SliderComponent: React.FC<{settings: SliderSettings, children: React.ReactNode}> = ({ settings, children }) => {
  return <Slider {...settings}>{children}</Slider>;
};

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    movies,
    fetchMovies,
    fetchTrending,
    loading,
    trending,
    error,
  } = useMovieStore();

  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreMovies, setGenreMovies] = useState<{[key: string]: MediaItem[]}>({});
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [selectedGenreForModal, setSelectedGenreForModal] = useState<number | null>(null);

  // Fetch genres and movie data
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        setIsRetrying(true);
        await Promise.all([
          fetchMovies(1),
          fetchTrending(timeWindow),
        ]);
        
        // Fetch genres
        const genreData = await getMovieGenres();
        if (genreData && genreData.genres) {
          setGenres(genreData.genres);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsRetrying(false);
      }
    };

    fetchData();
  }, [user, navigate, fetchMovies, fetchTrending, timeWindow, retryCount]);

  // Organize movies by genre when movies or genres change
  useEffect(() => {
    if (movies && movies.length > 0 && genres && genres.length > 0) {
      const moviesByGenre: {[key: string]: MediaItem[]} = {};
      
      // Initialize genre buckets
      genres.forEach(genre => {
        moviesByGenre[genre.name] = [];
      });
      
      // Sort movies into genre buckets
      movies.forEach(movie => {
        movie.genre_ids.forEach(genreId => {
          const genre = genres.find(g => g.id === genreId);
          if (genre) {
            if (!moviesByGenre[genre.name]) {
              moviesByGenre[genre.name] = [];
            }
            // Avoid duplicates
            if (!moviesByGenre[genre.name].some(m => m.id === movie.id)) {
              moviesByGenre[genre.name].push(movie);
            }
          }
        });
      });
      
      // Only keep genres with movies
      const filteredGenres: {[key: string]: MediaItem[]} = {};
      Object.keys(moviesByGenre).forEach(genreName => {
        if (moviesByGenre[genreName].length > 0) {
          filteredGenres[genreName] = moviesByGenre[genreName];
        }
      });
      
      setGenreMovies(filteredGenres);
      
      // Set first genre with movies as active
      if (Object.keys(filteredGenres).length > 0 && !activeGenre) {
        const firstGenreWithMovies = genres.find(g => 
          Object.keys(filteredGenres).includes(g.name)
        );
        if (firstGenreWithMovies) {
          setActiveGenre(firstGenreWithMovies.id);
        }
      }
    }
  }, [movies, genres, activeGenre]);

  const handleRefresh = () => {
    setRetryCount((prev) => prev + 1);
    setIsRetrying(true);
  };

  const trendingMovies: MediaItem[] = trending || [];
  const availableMovies: MediaItem[] = movies || [];
  
  // Traditional categories (not genre-based)
  const categories: CategoryDefinition[] = [
    {
      title: 'Trending Now',
      filter: () => false, // We use trendingMovies directly
      icon: <Film className="w-6 h-6" />,
      link: '/movies',
    },
    {
      title: 'Popular Movies',
      filter: (movie) => {
        return (movie.vote_count || 0) > 500;
      },
      icon: <Clock className="w-6 h-6" />,
      link: '/movies',
    },
  ];

  // Helper to get genre names for a movie
  const getGenreNames = (movie: MediaItem): string[] => {
    return movie.genre_ids
      .map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : null;
      })
      .filter((name): name is string => name !== null);
  };

  if (loading || isRetrying) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-center text-gray-300">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Loading your movie recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-300">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-lg">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <p className="text-xl mb-4">Error loading movies: {error}</p>
          <p className="mb-6">
            Please try again later or check your connection.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen pb-12">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 mb-8">
        <div className="container mx-auto px-4 py-8">
          <SearchBar />
          
          {/* Hero Carousel with fixed height */}
          <div className="relative mt-8">
            <div className="h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl">
              <SliderComponent settings={carouselSettings}>
                {trendingMovies.slice(0, 5).map((movie) => (
                  <div key={movie.id} className="relative h-full outline-none" role="group" aria-label={`Slide for ${movie.title || movie.name || 'Movie'}`}>
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                    <img
                      src={
                        movie.backdrop_path
                          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                          : '/placeholder-banner.jpg'
                      }
                      alt={movie.title || movie.name || 'Movie banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-banner.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-20">
                      <div className="container mx-auto px-4 h-full flex items-center">
                        <div className="max-w-xl">
                          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
                            {movie.title || movie.name}
                          </h2>
                          
                          {/* Genre tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getGenreNames(movie).slice(0, 3).map((genreName) => (
                              <span key={genreName} className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded-md text-xs">
                                {genreName}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-300 mb-4">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" aria-hidden="true" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                            <span className="mx-2">|</span>
                            <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                            <span>
                              {movie.release_date || movie.first_air_date
                                ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
                                : 'N/A'}
                            </span>
                          </div>
                          
                          <p className="text-gray-200 line-clamp-3 mb-6">{movie.overview}</p>
                          
                          <Link
                            to={`/movie/${movie.id}`}
                            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors group"
                            aria-label={`Watch ${movie.title || movie.name}`}
                          >
                            <PlayCircle className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" aria-hidden="true" />
                            Watch Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </SliderComponent>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setTimeWindow('day')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              timeWindow === 'day' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            id="day-filter-btn"
            aria-pressed={timeWindow === 'day'}
          >
            Today's Picks
          </button>
          <button
            onClick={() => setTimeWindow('week')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              timeWindow === 'week' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            id="week-filter-btn"
            aria-pressed={timeWindow === 'week'}
          >
            This Week's Hits
          </button>
        </div>

        {/* Traditional categories (Trending, Popular) */}
        {categories.map((category) => {
          let filteredMovies: MediaItem[] = [];
          
          if (category.title === 'Trending Now') {
            filteredMovies = trendingMovies;
          } else {
            filteredMovies = availableMovies.filter(category.filter).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          }
          
          const displayMovies = filteredMovies.slice(0, 6);
          
          return (
            <div key={category.title} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 bg-blue-900/30 p-2 rounded-lg" aria-hidden="true">{category.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-100">{category.title}</h2>
                </div>
                <Link
                  to={category.link}
                  className="flex items-center text-blue-500 hover:text-blue-400 transition-colors"
                  aria-label={`View all ${category.title}`}
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </div>
              {filteredMovies.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" aria-hidden="true" />
                  <p className="text-lg text-gray-300">No {category.title.toLowerCase()} available.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please check back later or try refreshing the page.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {displayMovies.map((movie) => (
                    <Link 
                      to={`/movie/${movie.id}`} 
                      key={movie.id} 
                      className="group"
                      aria-label={`View details for ${movie.title || movie.name}`}
                    >
                      <div className="relative overflow-hidden rounded-xl shadow-md bg-gray-800 transition-transform duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1">
                        {/* Poster Image */}
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={
                              movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : '/placeholder-movie.jpg'
                            }
                            alt={movie.title || movie.name || 'Movie poster'}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                            }}
                          />
                        </div>
                        
                        {/* Movie Info */}
                        <div className="p-3">
                          <h3 className="text-white font-bold truncate">{movie.title || movie.name}</h3>
                          
                          {/* Rating and Year */}
                          <div className="flex items-center justify-between text-sm text-gray-300 mt-1">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400" aria-hidden="true" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                              <span>
                                {movie.release_date || movie.first_air_date
                                  ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Genre Tags - Show only first genre */}
                          <div className="mt-2">
                            {getGenreNames(movie).slice(0, 1).map((genreName) => (
                              <span key={genreName} className="inline-block px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-md">
                                {genreName}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Play button overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                          <div className="bg-blue-600 p-3 rounded-full transform group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Genre Tabs */}
        {Object.keys(genreMovies).length > 0 && (
          <div className="mt-16 mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Browse by Genre</h2>
            
            {/* Genre Navigation */}
            <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <div className="flex space-x-2">
                {genres
                  .filter(genre => genreMovies[genre.name] && genreMovies[genre.name].length > 0)
                  .map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => setActiveGenre(genre.id)}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                        activeGenre === genre.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
              </div>
            </div>
            
            {/* Movies for Selected Genre */}
            {activeGenre && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {genres
                  .filter(genre => genre.id === activeGenre)
                  .map(genre => (
                    genreMovies[genre.name]?.slice(0, 6).map(movie => (
                      <Link 
                        to={`/movie/${movie.id}`} 
                        key={movie.id} 
                        className="group"
                        aria-label={`View details for ${movie.title || movie.name}`}
                      >
                        <div className="relative overflow-hidden rounded-xl shadow-md bg-gray-800 transition-transform duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1">
                          {/* Poster Image */}
                          <div className="aspect-[2/3] overflow-hidden">
                            <img
                              src={
                                movie.poster_path
                                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                  : '/placeholder-movie.jpg'
                              }
                              alt={movie.title || movie.name || 'Movie poster'}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                              }}
                            />
                          </div>
                          
                          {/* Movie Info */}
                          <div className="p-3">
                            <h3 className="text-white font-bold truncate">{movie.title || movie.name}</h3>
                            
                            {/* Rating and Year */}
                            <div className="flex items-center justify-between text-sm text-gray-300 mt-1">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" aria-hidden="true" />
                                <span>{movie.vote_average.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                                <span>
                                  {movie.release_date || movie.first_air_date
                                    ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Play button overlay on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                            <div className="bg-blue-600 p-3 rounded-full transform group-hover:scale-110 transition-transform">
                              <PlayCircle className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ))}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Link
                to="/movies"
                className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Browse All Movies <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Browse All Genres Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {genres.map(genre => (
              <button 
                key={genre.id}
                onClick={() => setSelectedGenreForModal(genre.id)}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors flex flex-col items-center justify-center aspect-square"
              >
                <span className="text-lg font-medium">{genre.name}</span>
                <span className="text-xs text-gray-400 mt-1">View movies</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Genre Modal */}
      {selectedGenreForModal !== null && (
        <GenreModal 
          genreId={selectedGenreForModal}
          isOpen={selectedGenreForModal !== null}
          onClose={() => setSelectedGenreForModal(null)}
        />
      )}

      {/* Add custom styling for the carousel */}
      <style>{`
        .custom-dots {
          position: absolute;
          bottom: 15px;
          display: flex !important;
          justify-content: center;
          width: 100%;
          padding: 0;
          margin: 0;
          list-style: none;
          z-index: 30;
        }
        .custom-dots li {
          margin: 0 4px;
        }
        .custom-dots li button {
          border: 0;
          background: rgba(255, 255, 255, 0.5);
          height: 8px;
          width: 8px;
          border-radius: 50%;
          padding: 0;
          font-size: 0;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }
        .custom-dots li.slick-active button {
          background: #3b82f6;
          width: 24px;
          border-radius: 4px;
        }
        .carousel-wrapper .slick-arrow {
          z-index: 40;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .carousel-wrapper:hover .slick-arrow {
          opacity: 0.7;
        }
        .carousel-wrapper .slick-arrow:hover {
          opacity: 1;
          background: rgba(59, 130, 246, 0.8);
        }
        .carousel-wrapper .slick-prev {
          left: 20px;
        }
        .carousel-wrapper .slick-next {
          right: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default Home;