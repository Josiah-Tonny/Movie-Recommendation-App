import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getTVSeriesDetails } from '../lib/tmdb';
import { Loader2, Heart, Bookmark } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TVSeriesCard from '../components/TVSeriesCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

// Update the TabContext and related components 
const TabContext = React.createContext<{
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}>({ 
  selectedIndex: 0, 
  setSelectedIndex: () => {} 
});

const TabGroup: React.FC<{
  selectedIndex: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}> = ({ selectedIndex, onChange, children }) => {
  return (
    <TabContext.Provider value={{ selectedIndex, setSelectedIndex: onChange }}>
      {children}
    </TabContext.Provider>
  );
};

const TabList: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = "", 
  children 
}) => {
  return <div className={className}>{children}</div>;
};

// Update the Tab component to use proper typing
const Tab: React.FC<{ 
  className?: string | ((props: { selected: boolean }) => string); 
  children: React.ReactNode;
  index?: number;
}> = ({ className, children, index = 0 }) => {
  const { selectedIndex, setSelectedIndex } = React.useContext(TabContext);
  const selected = selectedIndex === index;
  
  return (
    <button
      className={typeof className === 'function' ? className({ selected }) : className}
      onClick={() => setSelectedIndex(index)}
      type="button"
    >
      {children}
    </button>
  );
};

const TabPanels: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedIndex } = React.useContext(TabContext);
  const childrenArray = React.Children.toArray(children);
  return <>{childrenArray[selectedIndex]}</>;
};

const TabPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Define types for movie and TV series data
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  mediaType: 'movie' | 'tv';
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
    }>;
  };
}

const MyListsPage: React.FC = () => {
  const { favorites, watchlist } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0); // 0 = Favorites, 1 = Watchlist
  
  // Fetch details for favorited items
  const { data: favoriteItems, isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites', favorites],
    queryFn: async () => {
      if (!favorites || favorites.length === 0) return [];
      
      // Fetch details for each favorited item (could be movies or TV shows)
      const itemPromises = favorites.map(async (id) => {
        try {
          // Try to fetch as movie first
          const movieData = await getMovieDetails(id.toString());
          return { ...movieData, mediaType: 'movie' };
        } catch (_) {
          // If that fails, try to fetch as TV show (using _ to indicate unused variable)
          try {
            const tvData = await getTVSeriesDetails(id.toString());
            return { ...tvData, mediaType: 'tv' };
          } catch (innerError) {
            console.error(`Failed to fetch item with ID ${id}:`, innerError);
            return null;
          }
        }
      });
      
      const results = await Promise.all(itemPromises);
      return results.filter(item => item !== null);
    },
    enabled: favorites && favorites.length > 0
  });
  
  // Fetch details for watchlisted items
  const { data: watchlistItems, isLoading: loadingWatchlist } = useQuery({
    queryKey: ['watchlist', watchlist],
    queryFn: async () => {
      if (!watchlist || watchlist.length === 0) return [];
      
      // Fetch details for each watchlisted item
      const itemPromises = watchlist.map(async (id) => {
        try {
          // Try to fetch as movie first
          const movieData = await getMovieDetails(id.toString());
          return { ...movieData, mediaType: 'movie' };
        } catch (_) {
          // If that fails, try to fetch as TV show (using _ to indicate unused variable)
          try {
            const tvData = await getTVSeriesDetails(id.toString());
            return { ...tvData, mediaType: 'tv' };
          } catch (innerError) {
            console.error(`Failed to fetch item with ID ${id}:`, innerError);
            return null;
          }
        }
      });
      
      const results = await Promise.all(itemPromises);
      return results.filter(item => item !== null);
    },
    enabled: watchlist && watchlist.length > 0
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Lists</h1>
      
      <TabGroup selectedIndex={activeTab} onChange={setActiveTab}>
        <TabList className="flex space-x-4 mb-8">
          <Tab 
            index={0}
            className={({ selected }) => 
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                selected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <Heart className="w-5 h-5 mr-2" />
            <span>Favorites</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
              {favorites?.length || 0}
            </span>
          </Tab>
          <Tab 
            index={1}
            className={({ selected }) => 
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                selected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <Bookmark className="w-5 h-5 mr-2" />
            <span>Watchlist</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
              {watchlist?.length || 0}
            </span>
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Favorites Panel */}
          <TabPanel>
            {loadingFavorites ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <span className="ml-2 text-lg">Loading your favorites...</span>
              </div>
            ) : favoriteItems && favoriteItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {favoriteItems.map((item: MediaItem) => (
                  item.mediaType === 'movie' ? (
                    <MovieCard 
                      key={`movie-${item.id}`}
                      id={item.id}
                      title={item.title!}
                      posterPath={item.poster_path}
                      overview={item.overview}
                      rating={item.vote_average}
                      releaseDate={item.release_date && new Date(item.release_date).toLocaleDateString()}
                      cast={item.credits?.cast?.slice(0, 5)}
                    />
                  ) : (
                    <TVSeriesCard
                      key={`tv-${item.id}`}
                      id={item.id}
                      name={item.name!}
                      posterPath={item.poster_path}
                      overview={item.overview}
                      rating={item.vote_average}
                      firstAirDate={item.first_air_date}
                      seasons={item.number_of_seasons}
                      cast={item.credits?.cast?.slice(0, 5)}
                    />
                  )
                ))}
              </div>
            ) : (
              <EmptyState
                title="No favorites yet"
                description="Start adding movies and TV shows to your favorites by clicking the heart icon."
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => window.location.href = '/movies'}
                  >
                    Discover Movies
                  </Button>
                }
              />
            )}
          </TabPanel>
          
          {/* Watchlist Panel */}
          <TabPanel>
            {loadingWatchlist ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <span className="ml-2 text-lg">Loading your watchlist...</span>
              </div>
            ) : watchlistItems && watchlistItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {watchlistItems.map((item: MediaItem) => (
                  item.mediaType === 'movie' ? (
                    <MovieCard 
                      key={`movie-${item.id}`}
                      id={item.id}
                      title={item.title!}
                      posterPath={item.poster_path}
                      overview={item.overview}
                      rating={item.vote_average}
                      releaseDate={item.release_date && new Date(item.release_date).toLocaleDateString()}
                      cast={item.credits?.cast?.slice(0, 5)}
                    />
                  ) : (
                    <TVSeriesCard
                      key={`tv-${item.id}`}
                      id={item.id}
                      name={item.name!}
                      posterPath={item.poster_path}
                      overview={item.overview}
                      rating={item.vote_average}
                      firstAirDate={item.first_air_date}
                      seasons={item.number_of_seasons}
                      cast={item.credits?.cast?.slice(0, 5)}
                    />
                  )
                ))}
              </div>
            ) : (
              <EmptyState
                title="Your watchlist is empty"
                description="Keep track of what you want to watch by clicking the bookmark icon."
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => window.location.href = '/tv'}
                  >
                    Browse TV Series
                  </Button>
                }
              />
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default MyListsPage;
