import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useTVSeriesStore } from '../store/tvSeriesStore';
import TVSeriesPage from '../pages/TVSeriesPage';
import TVSeriesGrid from '../components/TVSeriesGrid';
import TVSeriesCard from '../components/TVSeriesCard';

// Mock the TV series store
vi.mock('../store/tvSeriesStore', () => ({
  useTVSeriesStore: vi.fn(),
}));

// Mock hooks used in components
vi.mock('../hooks/useDebounce', () => ({
  useDebounce: (value: any, delay: number) => value
}));

describe('TV Series Components', () => {
  // Mock data
  const mockSeries = [
    {
      id: 1,
      name: 'Test Series 1',
      poster_path: '/poster1.jpg',
      backdrop_path: '/backdrop1.jpg',
      overview: 'This is a test TV series overview',
      vote_average: 8.5,
      first_air_date: '2023-01-01',
      popularity: 100,
      vote_count: 1000,
      genre_ids: [10765, 18]
    },
    {
      id: 2,
      name: 'Test Series 2',
      poster_path: '/poster2.jpg',
      backdrop_path: '/backdrop2.jpg',
      overview: 'Another test TV series overview',
      vote_average: 7.8,
      first_air_date: '2023-02-15',
      popularity: 90,
      vote_count: 800,
      genre_ids: [10759, 16]
    }
  ];

  const mockFetchSeries = vi.fn();
  const mockSearchForSeries = vi.fn();

  beforeEach(() => {
    vi.mocked(useTVSeriesStore).mockReturnValue({
      series: mockSeries,
      loading: false,
      error: null,
      fetchSeries: mockFetchSeries,
      searchForSeries: mockSearchForSeries,
      currentPage: 1,
      totalPages: 5,
      currentCategory: 'popular',
      searchQuery: ''
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders TVSeriesGrid with series data', () => {
    render(
      <BrowserRouter>
        <TVSeriesGrid />
      </BrowserRouter>
    );
    
    // Check if TV series are displayed
    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 2')).toBeInTheDocument();
    expect(screen.getByText('2 series found')).toBeInTheDocument();
  });

  it('renders TVSeriesCard correctly', () => {
    render(
      <BrowserRouter>
        <TVSeriesCard
          id={1}
          name="Breaking Bad"
          posterPath="/poster.jpg"
          overview="A high school chemistry teacher turned methamphetamine manufacturer."
          rating={9.5}
          firstAirDate="2008-01-20"
          seasons={5}
        />
      </BrowserRouter>
    );
    
    // Check if card elements are displayed correctly
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('A high school chemistry teacher turned methamphetamine manufacturer.')).toBeInTheDocument();
    expect(screen.getByText('9.5')).toBeInTheDocument();
    
    // Check if link points to correct route
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/tv/1');
  });

  it('renders loading state when fetching TV series', () => {
    // Override the mock to show loading state
    vi.mocked(useTVSeriesStore).mockReturnValueOnce({
      series: [],
      loading: true,
      error: null,
      fetchSeries: mockFetchSeries,
    } as any);

    render(
      <BrowserRouter>
        <TVSeriesGrid />
      </BrowserRouter>
    );
    
    // Check for loading indicator
    expect(screen.getByText('Loading TV series...')).toBeInTheDocument();
  });

  it('renders TVSeriesPage with category filters', () => {
    render(
      <BrowserRouter>
        <TVSeriesPage />
      </BrowserRouter>
    );
    
    // Check for category filters
    expect(screen.getByRole('button', { name: 'Popular' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Top Rated' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Currently Airing' })).toBeInTheDocument();
    
    // Check if fetchSeries was called on mount
    expect(mockFetchSeries).toHaveBeenCalledWith('popular');
  });

  it('allows searching for TV series', () => {
    render(
      <BrowserRouter>
        <TVSeriesPage />
      </BrowserRouter>
    );
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search TV series...');
    
    // Type in search query
    fireEvent.change(searchInput, { target: { value: 'breaking bad' } });
    
    // Check if search function was called
    expect(mockSearchForSeries).toHaveBeenCalledWith('breaking bad');
  });
});
