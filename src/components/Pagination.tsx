import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons for pagination buttons
import { useMovieStore } from '../store/movieStore'; // Import our movie store to access state and actions

/**
 * Pagination Component
 * 
 * This component creates a pagination interface that allows users to navigate through
 * multiple pages of movie results. It shows the current page number and total pages,
 * and provides buttons to move to the previous or next page.
 * 
 * The component gets its data and functions from the movieStore.
 */
const Pagination: React.FC = () => {
  // Get necessary state and functions from our movie store
  const { 
    currentPage,  // The current page we're viewing
    totalPages,   // Total number of pages available
    fetchMovies,  // Function to fetch movies for a specific page
    searchQuery,  // Current search term (if any)
    searchForMovies // Function to search movies with a term for a specific page
  } = useMovieStore();

  /**
   * Handles changing to a different page
   * 
   * If we have a search query active, we search for that term on the new page
   * Otherwise, we just fetch regular movies for the new page
   * 
   * @param page - The page number to navigate to
   */
  const handlePageChange = (page: number) => {
    // Check if we're in search mode or regular browsing
    if (searchQuery) {
      // If searching, fetch search results for the new page
      searchForMovies(searchQuery, page);
    } else {
      // If normal browsing, fetch regular movies for the new page
      fetchMovies(page);
    }
  };

  // Return the pagination UI elements
  return (
    <div className="flex justify-center items-center space-x-4 mt-8">
      {/* Previous page button - disabled when on first page */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {/* Page information display */}
      <span>
        Page {currentPage} of {totalPages}
      </span>
      
      {/* Next page button - disabled when on last page */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
        aria-label="Go to next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;