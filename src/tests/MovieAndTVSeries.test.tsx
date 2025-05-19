import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMovieStore } from '../store/movieStore';
import { useTVSeriesStore } from '../store/tvSeriesStore';
import MovieCard from '../components/MovieCard';
import TVSeriesCard from '../components/TVSeriesCard';
import MovieList from '../pages/MovieList';

// Mock the store modules
vi.mock('../store/movieStore', () => ({
  useMovieStore: vi.fn(),
}));

vi.mock('../store/tvSeriesStore', () => ({
  useTVSeriesStore: vi.fn(),
}));

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '', pathname: '/movies' }),
}));

describe('Movie and TV Series Integration', () => {
  // Mock data
  const mockMovies = [
    {
      id: 1,
      title: 'Inception',
      poster_path: '/poster1.jpg',
      overview: 'A dream within a dream',
      vote_average: 8.8,
      genre_ids: [28, 878]
    }
  ];
  
  const mockTVSeries = [
    {
      id: 101,
      name: 'Breaking Bad',
      poster_path: '/poster2.jpg',
      overview: 'A chemistry teacher turned drug lord',
      vote_average: 9.5,
      genre_ids: [18, 80]
    }
  ];

  const mockFetchMovies = vi.fn();
  const mockFetchSeries = vi.fn();
  
  beforeEach(() => {
    vi.mocked(useMovieStore).mockReturnValue({
      movies: mockMovies,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
      currentPage: 1,
      totalPages: 10,
      searchQuery: '',
      setSearchParams: vi.fn(),
      searchForMovies: vi.fn()
    } as any);
    
    vi.mocked(useTVSeriesStore).mockReturnValue({
      series: mockTVSeries,
      loading: false,
      error: null,
      fetchSeries: mockFetchSeries,
      currentPage: 1,
      totalPages: 5,
      currentCategory: 'popular',
      searchQuery: '',
      searchForSeries: vi.fn()
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders MovieCard component correctly', () => {
    render(
      <BrowserRouter>
        <MovieCard
          id={1}
          title="Inception"
          posterPath="/poster1.jpg"
          overview="A dream within a dream"
          rating={8.8}
        />
      </BrowserRouter>
    );
    
    // Check if movie card elements are displayed correctly
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('A dream within a dream')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    
    // Check if link points to the correct movie detail page
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/movie/1');
  });

  it('renders TVSeriesCard component correctly', () => {
    render(
      <BrowserRouter>
        <TVSeriesCard
          id={101}
          name="Breaking Bad"
          posterPath="/poster2.jpg"
          overview="A chemistry teacher turned drug lord"
          rating={9.5}
        />
      </BrowserRouter>
    );
    
    // Check if TV series card elements are displayed correctly
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('A chemistry teacher turned drug lord')).toBeInTheDocument();
    expect(screen.getByText('9.5')).toBeInTheDocument();
    
    // Check if link points to the correct TV series detail page
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/tv/101');
  });

  it('renders MovieList with movie type and filters out TV series', () => {
    // Set up a mixed content store with both movies and TV series
    const mixedContent = [...mockMovies, ...mockTVSeries.map(tv => ({ ...tv, title: null }))];
    vi.mocked(useMovieStore).mockReturnValueOnce({
      movies: mixedContent,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
      currentPage: 1,
      totalPages: 10,
      searchQuery: '',
      setSearchParams: vi.fn(),
      searchForMovies: vi.fn()
    } as any);
    
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Should show movies but not TV series
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
  });

  it('renders MovieList with tv type and filters out movies', () => {
    // Set up a mixed content store with both movies and TV series
    const mixedContent = [...mockMovies, ...mockTVSeries.map(tv => ({ ...tv, id: tv.id, title: undefined }))];
    vi.mocked(useMovieStore).mockReturnValueOnce({
      movies: mixedContent,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
      currentPage: 1,
      totalPages: 10,
      searchQuery: '',
      setSearchParams: vi.fn(),
      searchForMovies: vi.fn()
    } as any);
    
    render(
      <BrowserRouter>
        <MovieList type="tv" />
      </BrowserRouter>
    );
    
    // Should show TV series but not movies
    expect(screen.queryByText('Inception')).not.toBeInTheDocument();
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
  });
});
