/**
 * TV Series Store
 * 
 * This file contains the Zustand store for managing TV series data.
 * It handles fetching popular TV series, searching for TV series,
 * and maintaining the application state related to TV shows.
 */

import { create } from 'zustand';
import { getPopularTVSeries, getTopRatedTVSeries, getOnAirTVSeries, searchTVSeries } from '../lib/tmdb';

/**
 * TV Series Interface
 * 
 * Represents the structure of a TV series object with essential properties
 */
interface TVSeries {
  id: number;            // Unique identifier for the TV series
  name: string;          // Title of the TV series
  poster_path: string | null;   // URL path for the poster image
  backdrop_path: string | null; // URL path for the backdrop image
  overview: string;      // Plot summary/description
  vote_average: number;  // Average rating (0-10)
  first_air_date?: string; // Original air date (optional)
  genre_ids: number[];   // Genres associated with the series
  origin_country?: string[]; // Countries of origin
  popularity?: number;   // Popularity score
  vote_count?: number;   // Number of votes
}

/**
 * TV Series State Interface
 * Defines the structure of the TV series store state and actions
 */
interface TVSeriesState {
  series: TVSeries[];    // Array of TV series
  loading: boolean;      // Loading state indicator
  error: string | null;  // Error message if any
  currentPage: number;   // Current page number for pagination
  totalPages: number;    // Total number of available pages
  searchQuery: string;   // Current search query
  currentCategory: 'popular' | 'top_rated' | 'on_air';  // Selected category filter
  
  // Cache to prevent unnecessary API calls
  seriesCache: Record<string, { data: TVSeries[], timestamp: number }>;
  
  fetchSeries: (category: 'popular' | 'top_rated' | 'on_air', page?: number) => Promise<void>;  // Fetch series by category
  searchForSeries: (query: string, page?: number) => Promise<void>;  // Search series by query
  clearCache: () => void; // Clear the cache when needed
}

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

/**
 * TV Series Store using Zustand
 */
export const useTVSeriesStore = create<TVSeriesState>((set, get) => ({
  // Initial state
  series: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  searchQuery: '',
  currentCategory: 'popular',
  seriesCache: {},
  
  /**
   * Fetches TV series based on category
   */
  fetchSeries: async (category = 'popular', page = 1) => {
    try {
      // Start loading state
      set({ loading: true, error: null, currentCategory: category });
      
      // Check cache first
      const cacheKey = `${category}_${page}`;
      const cachedData = get().seriesCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
        console.log(`Using cached data for ${category} series, page ${page}`);
        set({
          series: cachedData.data,
          currentPage: page,
          totalPages: Math.ceil(cachedData.data.length / 20),
          loading: false,
          searchQuery: '',
        });
        return;
      }
      
      // Fetch fresh data if not in cache or cache expired
      let data;
      switch (category) {
        case 'popular':
          data = await getPopularTVSeries(page);
          break;
        case 'top_rated':
          data = await getTopRatedTVSeries(page);
          break;
        case 'on_air':
          data = await getOnAirTVSeries(page);
          break;
        default:
          throw new Error(`Invalid category: ${category}`);
      }
      
      // Verify we have valid data
      if (!data || !data.results) {
        throw new Error(`Failed to fetch ${category} TV series data`);
      }
      
      // Update cache and state
      const updatedCache = {
        ...get().seriesCache,
        [cacheKey]: { data: data.results, timestamp: Date.now() }
      };
      
      set({
        series: data.results,
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        loading: false,
        searchQuery: '',
        seriesCache: updatedCache
      });
    } catch (error) {
      console.error(`Error fetching ${category} TV series:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch TV series', 
        loading: false 
      });
    }
  },
  
  /**
   * Searches for TV series matching a specific query
   */
  searchForSeries: async (query: string, page = 1) => {
    if (!query.trim()) {
      // If query is empty, just fetch popular series
      get().fetchSeries('popular', 1);
      return;
    }
    
    try {
      // Start loading state
      set({ loading: true, error: null, searchQuery: query });
      
      // Check cache first
      const cacheKey = `search_${query}_${page}`;
      const cachedData = get().seriesCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
        console.log(`Using cached data for search: "${query}", page ${page}`);
        set({
          series: cachedData.data,
          currentPage: page,
          totalPages: Math.ceil(cachedData.data.length / 20),
          loading: false,
        });
        return;
      }
      
      // Fetch fresh search results
      const data = await searchTVSeries(query, page);
      
      // Verify we have valid data
      if (!data || !data.results) {
        throw new Error('Failed to search TV series');
      }
      
      // Update cache and state
      const updatedCache = {
        ...get().seriesCache,
        [cacheKey]: { data: data.results, timestamp: Date.now() }
      };
      
      set({
        series: data.results,
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        loading: false,
        seriesCache: updatedCache
      });
    } catch (error) {
      console.error(`Error searching TV series for "${query}":`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search TV series', 
        loading: false 
      });
    }
  },
  
  /**
   * Clears the cache
   */
  clearCache: () => {
    set({ seriesCache: {} });
  }
}));
