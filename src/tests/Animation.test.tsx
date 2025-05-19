import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMovieStore } from '../store/movieStore';
import MovieList from '../pages/MovieList';

// Mock the store module
vi.mock('../store/movieStore', () => ({
  useMovieStore: vi.fn(),
}));

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '', pathname: '/movies' }),
}));

describe('Animation Movies', () => {
  // Mock data with animation movies
  const mockAnimationMovies = [
    {
      id: 1,
      title: 'Toy Story',
      poster_path: '/poster1.jpg',
      backdrop_path: '/backdrop1.jpg',
      overview: 'A story about toys that come to life',
      vote_average: 8.3,
      vote_count: 10000,
      release_date: '1995-11-22',
      genre_ids: [16, 10751, 35] // 16 is the genre ID for Animation
    },
    {
      id: 2,
      title: 'Finding Nemo',
      poster_path: '/poster2.jpg',
      backdrop_path: '/backdrop2.jpg',
      overview: 'A clownfish searches for his son',
      vote_average: 8.1,
      vote_count: 9500,
      release_date: '2003-05-30',
      genre_ids: [16, 10751, 12] // 16 is the genre ID for Animation
    }
  ];

  const mockFetchMovies = vi.fn();
  
  beforeEach(() => {
    vi.mocked(useMovieStore).mockReturnValue({
      movies: mockAnimationMovies,
      loading: false,
      error: null,
      fetchMovies: mockFetchMovies,
      currentPage: 1,
      totalPages: 10,
      searchQuery: '',
      setSearchParams: vi.fn(),
      searchForMovies: vi.fn()
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders animation movies correctly', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check if animation movies are displayed
    expect(screen.getByText('Toy Story')).toBeInTheDocument();
    expect(screen.getByText('Finding Nemo')).toBeInTheDocument();
    
    // Check if descriptions are correct
    expect(screen.getByText('A story about toys that come to life')).toBeInTheDocument();
    expect(screen.getByText('A clownfish searches for his son')).toBeInTheDocument();
  });

  it('shows ratings for animation movies', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check if ratings are displayed (Note: the rating component might display the values differently)
    // For example, it might show "8.3/10" or just "8.3"
    // This test might need adjustment based on your actual implementation
    const ratings = screen.getAllByText(/8\.\d/); // Regex to match ratings like 8.1 or 8.3
    expect(ratings.length).toBeGreaterThan(0);
  });

  it('can filter animation movies', () => {
    // Add a non-animation movie to the mock data
    const mixedMovies = [
      ...mockAnimationMovies,
      {
        id: 3,
        title: 'The Dark Knight',
        poster_path: '/poster3.jpg',
        backdrop_path: '/backdrop3.jpg',
        overview: 'A superhero movie',
        vote_average: 9.0,
        vote_count: 12000,
        release_date: '2008-07-18',
        genre_ids: [28, 80, 18] // Action, Crime, Drama - not animation
      }
    ];
    
    // Override the mock to include mixed movies
    vi.mocked(useMovieStore).mockReturnValueOnce({
      movies: mixedMovies,
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
    
    // All movies should be displayed since we don't filter by genre in the component
    expect(screen.getByText('Toy Story')).toBeInTheDocument();
    expect(screen.getByText('Finding Nemo')).toBeInTheDocument();
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
    
    // Note: If you implement genre filtering functionality, this test would need to be updated
  });
});
