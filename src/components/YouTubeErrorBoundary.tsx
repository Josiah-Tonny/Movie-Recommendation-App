import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class YouTubeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('YouTube component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
          <h3 className="font-medium mb-1">Video player error</h3>
          <p className="text-sm text-gray-400">
            There was a problem loading the video player. This is often caused by ad blockers.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default YouTubeErrorBoundary;