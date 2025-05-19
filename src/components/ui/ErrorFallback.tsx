import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  retryAction?: () => void;
  homeAction?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  title = "Something went wrong", 
  message = "There was a problem loading the content. Please try again.",
  retryAction,
  homeAction
}) => {
  return (
    <div className="bg-gray-800/60 rounded-lg p-6 text-center max-w-lg mx-auto my-8 border border-gray-700">
      <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <p className="text-gray-400 mb-6">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {retryAction && (
          <Button
            variant="primary"
            onClick={retryAction}
          >
            Try Again
          </Button>
        )}
        {homeAction && (
          <Button
            variant="outline"
            onClick={homeAction}
          >
            Return Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;