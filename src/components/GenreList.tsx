import React from 'react';
import { useMovieStore } from '../store/movieStore';

interface GenreListProps {
  onSelectGenre: (genreId: number | null) => void;
  selectedGenreId: number | null;
}

const GenreList: React.FC<GenreListProps> = ({ onSelectGenre, selectedGenreId }) => {
  const { genres } = useMovieStore();
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Filter by Genre</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectGenre(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedGenreId === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(genre.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedGenreId === genre.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreList;