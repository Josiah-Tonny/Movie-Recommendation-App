import axios from 'axios';
import { MovieResult, VideoResult, TVSeriesDetailResponse, MovieCredits } from '../types/movie';

// Define the missing handleApiError function
const handleApiError = (error: Error | unknown) => {
  console.error('API request failed:', error);
  
  let errorMessage = 'An unknown error occurred';
  
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const errorData = error.response.data as {status_message?: string};
      
      switch (status) {
        case 401:
          errorMessage = 'Invalid API key or unauthorized request';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = errorData?.status_message || `Error: ${status}`;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server. Please check your internet connection';
    } else {
      // Request setup error
      errorMessage = error.message;
    }
  }
  
  throw new Error(errorMessage);
};

// API configuration
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3/'; // TMDB API base URL

// More strict check for API key
if (!API_KEY || API_KEY.length === 0) {
  console.error('TMDB API key is missing. Please set VITE_TMDB_API_KEY in your .env file.');
  throw new Error('TMDB API key is required to use this application.');
}

// Create axios instance with common configuration
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US', // Default language setting
  },
  timeout: 30000, // Increase timeout to 30 seconds
});

// Add a response interceptor for global error handling
tmdbApi.interceptors.response.use(
  response => response,
  error => {
    // Log error details
    console.error('TMDB API Error:', error);
    
    // Format error message based on response
    let errorMessage = 'An unknown error occurred';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'Invalid API key or unauthorized request';
            break;
          case 404:
            errorMessage = 'The requested resource was not found';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Server error. Please try again later';
            break;
          default:
            errorMessage = errorData?.status_message || `Error: ${status}`;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'No response from server. Please check your internet connection';
      } else {
        // Request setup error
        errorMessage = error.message;
      }
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Utility function to add retry capability to API calls
const withRetry = async <T>(apiFn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
  try {
    return await apiFn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.log(`Retrying API call. Attempts remaining: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(apiFn, retries - 1, delay * 1.5);
  }
};

/**
 * Fetches popular movies from TMDB API
 * @param page - The page number for pagination (default: 1)
 * @param resultsPerPage - Number of results to return (default: 20, max: 50 for TMDB API)
 * @returns Promise containing movie data with results array and pagination info
 */
export const getPopularMovies = async (page = 1, resultsPerPage = 40): Promise<{
  results: MovieResult[];
  page: number;
  total_pages: number;
  total_results: number;
}> => {
  try {
    // Fetch multiple pages at once
    const pagesNeeded = Math.ceil(resultsPerPage / 20);
    const requests = [];
    
    for (let i = 0; i < pagesNeeded; i++) {
      requests.push(
        tmdbApi.get('/movie/popular', {
          params: { page: page + i },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    let allResults: MovieResult[] = [];
    
    // Combine all results
    responses.forEach(response => {
      allResults = [...allResults, ...response.data.results];
    });
    
    // Trim to requested size if needed
    const trimmedResults = allResults.slice(0, resultsPerPage);
    
    return {
      results: trimmedResults,
      page,
      total_pages: responses[0].data.total_pages,
      total_results: responses[0].data.total_results
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Searches for movies based on a query string
 * @param query - The search term to find movies
 * @param page - The page number for pagination (default: 1)
 * @param resultsPerPage - Number of results to return (default: 20, max: 50 for TMDB API)
 * @param includeAdult - Whether to include adult content in search results
 * @param year - Optional year to filter by
 * @returns Promise containing search results with matched movies
 */
export const searchMovies = async (
  query: string, 
  page = 1, 
  resultsPerPage = 20,
  includeAdult = false,
  year?: number
) => {
  try {
    // TMDB API only allows up to 50 results per page
    const perPage = Math.min(resultsPerPage, 50);
    
    const response = await tmdbApi.get('/search/movie', { 
      params: { 
        query, 
        page,
        include_adult: includeAdult,
        year: year,
        per_page: perPage 
      } 
    });
    
    // If user requested more than 50 results, make multiple requests
    if (resultsPerPage > 50 && response.data && response.data.results) {
      const additionalPages = Math.ceil((resultsPerPage - 50) / 50);
      const additionalResults = [];
      
      for (let i = 1; i <= additionalPages && page + i <= response.data.total_pages; i++) {
        const additionalResponse = await tmdbApi.get('/search/movie', {
          params: { 
            query, 
            page: page + i, 
            include_adult: includeAdult,
            year
          }
        });
        
        if (additionalResponse.data && additionalResponse.data.results) {
          additionalResults.push(...additionalResponse.data.results);
        }
      }
      
      // Combine the results
      response.data.results = [...response.data.results, ...additionalResults].slice(0, resultsPerPage);
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Retrieves detailed information about a specific movie
 * @param id - The TMDB ID of the movie
 * @returns Promise containing comprehensive movie details
 * We export this to provide detailed movie information for the movie detail pages
 */
export const getMovieDetails = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}`, {
      params: {
        append_to_response: 'videos,images,credits,reviews,similar', // Get additional data in one request
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMovieCredits = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/credits`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
  try {
    console.log(`Fetching trending movies for time window: ${timeWindow}`);
    
    // Fetch multiple pages to get more results
    const [page1, page2, page3] = await Promise.all([
      withRetry(() => tmdbApi.get(`/trending/movie/${timeWindow}`, { params: { page: 1 } }), 2, 1000),
      withRetry(() => tmdbApi.get(`/trending/movie/${timeWindow}`, { params: { page: 2 } }), 2, 1000),
      withRetry(() => tmdbApi.get(`/trending/movie/${timeWindow}`, { params: { page: 3 } }), 2, 1000)
    ]);
    
    // Combine results from all pages
    const results = [
      ...page1.data.results,
      ...page2.data.results,
      ...page3.data.results
    ];
    
    console.log(`Received ${results.length} trending movies`);
    
    return {
      results,
      page: 1,
      total_pages: page1.data.total_pages,
      total_results: results.length
    };
  } catch (error) {
    return handleApiError(error);
  }  
};

export const getMovieAlternativeTitles = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/alternative_titles`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMovieImages = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/images`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMovieKeywords = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/keywords`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Enhance getMovieVideos function to get better trailer results
 */
export const getMovieVideos = async (id: string): Promise<{results: VideoResult[]}> => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/videos`, {
      params: {
        language: 'en-US'  // Ensure English videos
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Add a new specialized function to get the best trailer
 */
export const getBestTrailer = (videos: VideoResult[]) => {
  if (!videos || videos.length === 0) return null;
  
  // Try to find official trailers first (in this priority order)
  const trailerTypes = ['Trailer', 'Teaser', 'Clip', 'Behind the Scenes'];
  
  for (const type of trailerTypes) {
    // First look for official YouTube trailers
    const officialTrailer = videos.find(
      video => video.type === type && 
               video.site === 'YouTube' && 
               video.official === true
    );
    
    if (officialTrailer) return officialTrailer;
    
    // Then accept any YouTube video of this type
    const anyTrailer = videos.find(
      video => video.type === type && video.site === 'YouTube'
    );
    
    if (anyTrailer) return anyTrailer;
  }
  
  // If no trailers found, return the first YouTube video if any
  return videos.find(video => video.site === 'YouTube') || null;
};

export const getSimilarMovies = async (id: string) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}/similar`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/now_playing', {
      params: { 
        page,
        region: 'US',
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { 
        page,
        region: 'US',
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMovieGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// TV Series API calls
export const getPopularTVSeries = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/popular', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTopRatedTVSeries = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/top_rated', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOnAirTVSeries = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/tv/on_the_air', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchTVSeries = async (query: string, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/tv', {
      params: { query, page },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTVSeriesDetails = async (id: string): Promise<TVSeriesDetailResponse> => {
  try {
    const response = await tmdbApi.get(`/tv/${id}`, {
      params: {
        append_to_response: 'videos,credits'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTVSeriesCredits = async (id: string): Promise<MovieCredits> => {
  try {
    const response = await tmdbApi.get(`/tv/${id}/credits`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTVSeriesSeasons = async (id: string, seasonNumber: number) => {
  try {
    const response = await tmdbApi.get(`/tv/${id}/season/${seasonNumber}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSimilarTVSeries = async (id: string): Promise<{
  results: MovieResult[];
  page: number;
  total_pages: number;
}> => {
  try {
    const response = await tmdbApi.get(`/tv/${id}/similar`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Add TV series videos function
export const getTVSeriesVideos = async (id: string): Promise<{results: VideoResult[]}> => {
  try {
    const response = await tmdbApi.get(`/tv/${id}/videos`, {
      params: {
        language: 'en-US'  // Ensure English videos
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Add discoverMoviesByGenre if it's missing
export const discoverMoviesByGenre = async (
  genreId: number, 
  page = 1,
  sortBy = 'popularity.desc'
): Promise<{
  results: MovieResult[];
  page: number;
  total_pages: number;
  total_results: number;
}> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: sortBy
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};