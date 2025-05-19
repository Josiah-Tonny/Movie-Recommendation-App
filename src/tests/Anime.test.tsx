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

describe('Anime Movies', () => {
  // Mock data with anime movies
  const mockAnimeMovies = [
    {
      id: 1,
      title: 'Spirited Away',
      poster_path: '/poster1.jpg',
      backdrop_path: '/backdrop1.jpg',
      overview: 'A girl enters the spirit world',
      vote_average: 8.5,
      vote_count: 8000,
      release_date: '2001-07-20',
      genre_ids: [16, 10751, 14] // 16 is animation, 14 is fantasy
    },
    {
      id: 2,
      title: 'Your Name',
      poster_path: '/poster2.jpg',
      backdrop_path: '/backdrop2.jpg',
      overview: 'Two strangers find themselves linked in a bizarre way',
      vote_average: 8.4,
      vote_count: 6500,
      release_date: '2016-08-26',
      genre_ids: [16, 18, 10749] // 16 is animation, 18 is drama, 10749 is romance
    }
  ];

  const mockFetchMovies = vi.fn();
  
  beforeEach(() => {
    vi.mocked(useMovieStore).mockReturnValue({
      movies: mockAnimeMovies,
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

  it('renders anime movies correctly', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check if anime movies are displayed
    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    
    // Check if descriptions are correct
    expect(screen.getByText('A girl enters the spirit world')).toBeInTheDocument();
    expect(screen.getByText('Two strangers find themselves linked in a bizarre way')).toBeInTheDocument();
  });

  it('shows ratings for anime movies', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Check if ratings are displayed
    const ratings = screen.getAllByText(/8\.\d/); // Regex to match ratings like 8.4 or 8.5
    expect(ratings.length).toBeGreaterThan(0);
  });

  it('can search for anime movies', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText(/Search for movies/i);
    
    // Type "Spirited" in the search field
    fireEvent.change(searchInput, { target: { value: 'Spirited' } });
    
    // Submit the search form
    const form = searchInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    // Check if the search function was called with the correct query
    expect(vi.mocked(useMovieStore)().searchForMovies).toHaveBeenCalledWith('Spirited');
  });

  it('handles clicking on an anime movie', () => {
    render(
      <BrowserRouter>
        <MovieList type="movie" />
      </BrowserRouter>
    );
    
    // Find the link for "Spirited Away"
    const movieLink = screen.getByText('Spirited Away').closest('a');
    expect(movieLink).toHaveAttribute('href', '/movie/1');
    
    // Note: We can't test actual navigation since it's handled by React Router
    // and we're using a mock. This just verifies the link exists with the correct href.
  });
});
