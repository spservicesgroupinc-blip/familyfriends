import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to analytics in production (optional)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // You could send to your error tracking service here
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-red-200">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Your data is safe.
              </p>
              
              {this.state.hasError && (
                <div className="bg-gray-50 p-4 rounded-lg text-left text-sm mb-6">
                  <p className="font-semibold text-gray-700 mb-2">Error details:</p>
                  <p className="text-red-600 font-mono text-xs break-all">
                    {this.state.hasError.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    this.setState({ hasError: null, errorInfo: null });
                    window.location.reload();
                  }}
                  className="flex-1 py-3 bg-blue-950 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                >
                  Reload App
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Reset & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
