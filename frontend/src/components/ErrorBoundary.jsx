import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for future monitoring (e.g. Sentry or DataDog integration goes here)
    console.error("Global Error Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-6">
          <div className="max-w-xl w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
            <div className="flex items-center space-x-3 text-red-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-2xl font-bold">Application Error</h1>
            </div>
            <p className="text-slate-300 mb-4">
              We're sorry, but something went wrong. Our engineering team has been notified.
            </p>
            <div className="bg-slate-950 rounded-lg p-4 mb-6 overflow-x-auto border border-slate-800">
              <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-lg transition-colors shadow-lg shadow-sky-500/20"
              >
                Reload Page
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/'
                }}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
