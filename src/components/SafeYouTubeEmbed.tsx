import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface SafeYouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

const SafeYouTubeEmbed: React.FC<SafeYouTubeEmbedProps> = ({
  videoId,
  title,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use YouTube's privacy-enhanced mode URL
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500 mb-2" />
          <p className="font-medium mb-1">Failed to load video</p>
          <p className="text-sm text-gray-400 mb-3">Try watching directly on YouTube</p>
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            Open on YouTube
          </a>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        ></iframe>
      )}
    </div>
  );
};

export default SafeYouTubeEmbed;