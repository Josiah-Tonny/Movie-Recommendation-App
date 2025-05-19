import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import { useMovieStore } from '../store/movieStore';

// Mock the store module
vi.mock('../store/movieStore', () => ({
  useMovieStore: vi.fn(),
}));

describe('SearchBar', () => {
  const mockSearchForMovies = vi.fn();
  const mockFetchMovies = vi.fn();
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.mocked(useMovieStore).mockReturnValue({
      searchForMovies: mockSearchForMovies,
      fetchMovies: mockFetchMovies,
      setSearchParams: mockSetSearchParams,
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('calls searchForMovies with correct query when submitting', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search for movies or TV shows...');
    fireEvent.change(input, { target: { value: 'Inception' } });
    
    // Find the form and submit it
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(mockSearchForMovies).toHaveBeenCalledWith('Inception', 1, 50);
  });

  it('calls fetchMovies with default page when submitting with empty query', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    fireEvent.change(input, { target: { value: '' } });
    
    // Find the form and submit it
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(mockFetchMovies).toHaveBeenCalledWith(1, 40);
  });
});