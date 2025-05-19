import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMovieStore } from '../store/movieStore';
import MovieList from '../pages/MovieList';
import MovieGrid from '../components/MovieGrid';

// Mock the movie store
vi.mock('../store/movieStore', () => ({
  useMovieStore: vi.fn(),
}));

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '', pathname: '/movies' }),
}));

describe('Movie Components', () => {
  // Mock data
  const mockMovies = [
    {
      id: 1,
      title: 'Test Movie 1',
      poster_path: '/poster1.jpg',
      backdrop_path: '/backdrop1.jpg',
      overview: 'This is a test movie overview',
      vote_average: 8.5,
      vote_count: 1000,
      release_date: '2023-01-01',
      genre_ids: [28, 12]
    },
    {
      id: 2,
      title: 'Test Movie 2',
      poster_path: '/poster2.jpg',
      backdrop_path: '/backdrop2.jpg',
      overview: 'Another test movie overview',
      vote_average: 7.8,
      vote_count: 800,
      release_date: '2023-02-15',
      genre_ids: [35, 18]
    }
  ];

  const mockFetchMovies = vi.fn();
  const mockSearchForMovies = vi.fn();

  beforeEach(() => {
    vi.mocked(useMovieStore).mockReturnValue({
      movies: mockMovies,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
      searchForMovies: mockSearchForMovies,
      currentPage: 1,
      totalPages: 10,
      searchQuery: '',
      setSearchParams: vi.fn()
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders MovieList component with movie data', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check if movies are displayed
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    
    // Check if fetchMovies was called
    expect(mockFetchMovies).toHaveBeenCalledWith(1);
  });

  it('renders loading state when movies are being fetched', () => {
    // Override the mock to show loading state
    vi.mocked(useMovieStore).mockReturnValueOnce({
      movies: [],
      loading: true,
      error: null,
      fetchMovies: mockFetchMovies,
    } as any);

    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check for loading indicator (the Loader2 component renders an SVG)
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('filters movies based on type prop', () => {
    // Add a TV series item to the mock data
    const mixedContentMock = [
      ...mockMovies,
      {
        id: 3,
        name: 'Test TV Series', // TV series use 'name' instead of 'title'
        poster_path: '/poster3.jpg',
        backdrop_path: '/backdrop3.jpg',
        overview: 'A test TV series overview',
        vote_average: 9.0,
        vote_count: 1200,
        first_air_date: '2023-03-01',
        genre_ids: [10765, 18]
      }
    ];

    vi.mocked(useMovieStore).mockReturnValueOnce({
      movies: mixedContentMock,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
    } as any);

    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Should show movies but not TV series
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    expect(screen.queryByText('Test TV Series')).not.toBeInTheDocument();
  });
});
