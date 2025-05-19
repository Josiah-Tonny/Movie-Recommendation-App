import React, { useState } from 'react';
import { Youtube, AlertCircle, ExternalLink } from 'lucide-react';

interface VideoTrailerProps {
  videoKey: string;
  title: string;
  type?: string;
  isOfficial?: boolean;
  className?: string;
}

/**
 * VideoTrailer Component
 * 
 * A reusable component for displaying embedded YouTube videos
 */
const VideoTrailer: React.FC<VideoTrailerProps> = ({
  videoKey,
  title,
  type = 'Trailer',
  isOfficial = false,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Get badge color based on video type
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trailer':
        return 'bg-blue-900 text-blue-300';
      case 'teaser':
        return 'bg-purple-900 text-purple-300';
      case 'clip':
        return 'bg-green-900 text-green-300';
      case 'behind the scenes':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  // Construct YouTube URL for direct link
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;
  
  // Handle iframe load error
  const handleError = () => {
    setError(true);
  };
  
  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="relative aspect-video bg-gray-900">
        {!error ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
            )}
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${videoKey}?rel=0`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              onError={handleError}
              className={`absolute inset-0 w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            ></iframe>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-gray-300 mb-3">Failed to load video</p>
            <a 
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="mr-1">Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium truncate">{title}</h3>
        <div className="flex items-center mt-1">
          <span className={`inline-block mr-1 px-2 py-0.5 text-xs rounded ${getBadgeColor(type)}`}>
            {type}
          </span>
          {isOfficial && <span className="text-green-400 text-xs ml-1">Official</span>}
          <a 
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Watch on YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoTrailer;
