import { create } from 'zustand';
import { getPopularMovies, searchMovies, getTrendingMovies, getMovieGenres as getGenres, discoverMoviesByGenre } from '../lib/tmdb';
import { MovieResult, Genre } from '../types/movie';

// Search parameters interface
interface SearchParams {
  query: string;
  resultsPerPage: number;
  includeAdult: boolean;
  year?: number;
}

// MovieState interface with added genre and cache features
interface MovieState {
  movies: MovieResult[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  genres: Genre[];
  selectedGenreId: number | null;
  trending: MovieResult[]; // Added trending property
  searchParams: SearchParams;
  movieCache: Record<string, MovieResult[]>;

  fetchMovies: (page?: number, resultsPerPage?: number) => Promise<void>;
  searchForMovies: (query: string, page?: number, resultsPerPage?: number) => Promise<void>;
  fetchTrending: (timeWindow: 'day' | 'week') => Promise<void>;
  fetchGenres: () => Promise<void>;
  setSelectedGenre: (genreId: number | null) => void;
  setSearchParams: (params: Partial<SearchParams>) => void;
  
  // Caching
  clearCache: () => void;

  // New method to fetch movies by genre
  fetchMoviesByGenre: (
    genreId: number, 
    page?: number, 
    sortBy?: 'popularity' | 'rating' | 'release_date', 
    isDescending?: boolean
  ) => Promise<void>;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  searchQuery: '',
  genres: [],
  selectedGenreId: null,
  trending: [], // Initialize trending array
  movieCache: {},
  searchParams: {
    query: '',
    resultsPerPage: 40, // Default to 40 results
    includeAdult: false,
  },

  setSearchParams: (params) => {
    set(state => ({
      searchParams: {
        ...state.searchParams,
        ...params
      }
    }));
  },

  fetchMovies: async (page = 1, resultsPerPage = 40) => {
    const cacheKey = `movies-${page}-${resultsPerPage}`;
    const cached = get().movieCache[cacheKey];
    
    if (cached && cached.length > 0) {
      console.log(`Using cached data for page ${page}`);
      set({ 
        movies: cached, 
        currentPage: page, 
        loading: false,
        searchQuery: '' 
      });
      return;
    }

    try {
      set({ loading: true, error: null });
      console.log(`Fetching ${resultsPerPage} movies for page ${page}`);
      
      const data = await getPopularMovies(page, resultsPerPage);
      
      // Validate the response data
      if (!data || !data.results) {
        throw new Error('Invalid response from the movie API');
      }
      
      console.log(`Received ${data.results.length} movies from API`);
      
      const filtered = get().selectedGenreId
        ? data.results.filter((m: MovieResult) => m.genre_ids.includes(get().selectedGenreId!))
        : data.results;

      set(state => ({
        movies: filtered,
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        loading: false,
        error: null,
        searchQuery: '',
        movieCache: { ...state.movieCache, [cacheKey]: filtered },
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error fetching movies:', error);
      set({ 
        error: errorMessage || 'Failed to fetch movies. Please try again later.', 
        loading: false 
      });
    }
  },

  searchForMovies: async (query: string, page = 1, resultsPerPage = 40) => {
    try {
      set({ 
        loading: true, 
        error: null, 
        searchQuery: query,
        searchParams: {
          ...get().searchParams,
          query,
          resultsPerPage
        }
      });
      
      console.log(`Searching for movies with query "${query}" on page ${page}, results per page: ${resultsPerPage}`);
      
      const data = await searchMovies(query, page, resultsPerPage, get().searchParams.includeAdult);
      
      // Validate the response data
      if (!data || !data.results) {
        throw new Error('Invalid response from the search API');
      }
      
      console.log(`Received ${data.results.length} search results`);
      
      // Sort results by year if possible (newest first by default)
      const sortedResults = [...data.results].sort((a, b) => {
        const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
        const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
        return yearB - yearA; // Sort by year descending (newest first)
      });
      
      set({
        movies: sortedResults,
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error searching movies:', error);
      set({ 
        error: errorMessage || 'Failed to search movies. Please try again later.', 
        loading: false 
      });
    }
  },

  fetchTrending: async (timeWindow = 'week') => {
    const cacheKey = `trending-${timeWindow}`;
    const cached = get().movieCache[cacheKey];
    
    if (cached && cached.length > 0) {
      console.log(`Using cached trending data for ${timeWindow}`);
      set({ trending: cached, loading: false });
      return;
    }

    try {
      set({ loading: true, error: null });
      console.log(`Fetching trending movies for ${timeWindow}`);
      
      const data = await getTrendingMovies(timeWindow);
      
      // Validate the response data
      if (!data || !data.results) {
        throw new Error('Invalid response from the trending API');
      }
      
      console.log(`Received ${data.results.length} trending movies`);
      
      const filtered = get().selectedGenreId
        ? data.results.filter((m: MovieResult) => m.genre_ids?.includes(get().selectedGenreId!))
        : data.results;

      set(state => ({
        trending: filtered,
        loading: false,
        error: null,
        movieCache: { ...state.movieCache, [cacheKey]: filtered },
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error fetching trending movies:', error);
      set({ 
        error: errorMessage || 'Failed to fetch trending movies. Please try again later.', 
        loading: false 
      });
    }
  },

  fetchGenres: async () => {
    try {
      const data = await getGenres();
      set({ genres: data.genres });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setSelectedGenre: (genreId: number | null) => {
    set({ selectedGenreId: genreId });
  },
  
  clearCache: () => {
    set({ movieCache: {} });
  },

  fetchMoviesByGenre: async (
    genreId: number, 
    page = 1, 
    sortBy: 'popularity' | 'rating' | 'release_date' = 'popularity',
    isDescending = true
  ) => {
    const cacheKey = `genre_${genreId}_${page}_${sortBy}_${isDescending}`;
    const cached = get().movieCache[cacheKey];
    
    if (cached && cached.length > 0) {
      console.log(`Using cached data for genre ${genreId}, page ${page}`);
      set({ 
        movies: cached, 
        currentPage: page,
        loading: false,
        selectedGenreId: genreId
      });
      return;
    }

    try {
      set({ 
        loading: true, 
        error: null,
        selectedGenreId: genreId
      });
      console.log(`Fetching movies for genre ${genreId}, page ${page}`);
      
      // Use the discoverMoviesByGenre function from tmdb.ts
      const data = await discoverMoviesByGenre(
        genreId, 
        page, 
        `${sortBy}.${isDescending ? 'desc' : 'asc'}`
      );
      
      if (!data || !data.results) {
        throw new Error('Invalid response from genre API');
      }
      
      console.log(`Received ${data.results.length} movies for genre ${genreId}`);
      
      set(state => ({
        movies: data.results as MovieResult[],
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        loading: false,
        error: null,
        searchQuery: '',
        movieCache: { 
          ...state.movieCache, 
          [cacheKey]: data.results as MovieResult[]
        },
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error(`Error fetching movies for genre ${genreId}:`, error);
      set({ 
        error: errorMessage || 'Failed to fetch genre movies', 
        loading: false 
      });
    }
  },
}));
