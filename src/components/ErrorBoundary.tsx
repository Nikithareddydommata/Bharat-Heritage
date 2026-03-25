import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore JSON error
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl serif italic mb-4 text-heritage-olive">Something went wrong.</h2>
          <p className="text-heritage-ink/60 serif mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-heritage-olive text-white rounded-full font-bold uppercase tracking-widest hover:bg-heritage-olive/90 transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
