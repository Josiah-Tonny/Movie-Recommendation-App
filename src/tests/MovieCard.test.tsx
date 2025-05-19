import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

describe('MovieCard', () => {
  const mockProps = {
    id: 1,
    title: 'Test Movie',
    posterPath: '/test-poster.jpg',
    overview: 'Test overview',
    rating: 8.5,
  };

  afterEach(() => {
    cleanup();
  });

  it('renders movie information correctly', () => {
    render(
      <BrowserRouter>
        <MovieCard {...mockProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Test overview')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    // Make sure the image has the correct source
    const posterImage = screen.getByAltText('Test Movie');
    // Check if it contains the path - can be more resilient if the complete URL includes the base path
    expect(posterImage).toHaveAttribute('src', expect.stringContaining('/test-poster.jpg'));
  });

  it('navigates to movie details page on click', () => {
    render(
      <BrowserRouter>
        <MovieCard {...mockProps} />
      </BrowserRouter>
    );

    const card = screen.getByText('Test Movie').closest('a');
    expect(card).toHaveAttribute('href', `/movie/${mockProps.id}`);
  });
});