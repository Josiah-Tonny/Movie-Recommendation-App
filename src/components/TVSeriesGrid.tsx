import React from 'react';
import { useTVSeriesStore } from '../store/tvSeriesStore';
import TVSeriesCard from './TVSeriesCard';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * TVSeriesGrid Component
 * 
 * This component displays a responsive grid of TV series cards.
 */
const TVSeriesGrid: React.FC = () => {
  const { series, loading, error } = useTVSeriesStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-200">Loading TV series...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 text-red-100 p-4 rounded-md flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
        <div>
          <p className="font-semibold">Error loading TV series</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg">
        <p className="text-xl font-semibold mb-2">No TV series found</p>
        <p className="text-gray-400">Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-400 mb-6 text-sm">{series.length} series found</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {series.map((show) => (
          <TVSeriesCard
            key={show.id}
            id={show.id}
            name={show.name}
            posterPath={show.poster_path}
            overview={show.overview}
            rating={show.vote_average}
            firstAirDate={show.first_air_date}
            // Pass number of seasons if available in the future
          />
        ))}
      </div>
    </div>
  );
};

export default TVSeriesGrid;
