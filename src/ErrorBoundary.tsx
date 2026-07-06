import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="message error mx-6 mt-8 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          <strong>Something went wrong.</strong>
          <p className="mt-2">
            This was likely caused by a browser extension interfering with the page.
            Try disabling extensions for this site or use an incognito window.
          </p>
          {this.state.error && (
            <pre className="mt-3 whitespace-pre-wrap">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-lg bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
