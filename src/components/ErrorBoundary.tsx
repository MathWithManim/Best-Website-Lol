import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../lib/sentry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error);
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#F5E6CA] dark:bg-[#1a120b] dark:text-[#f4d5ad] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-6xl" aria-hidden>💥</div>
        <h1 className="font-sans text-2xl font-bold">Something broke</h1>
        <p className="font-mono text-sm opacity-60 max-w-md">
          {this.state.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => window.location.assign('/')}
          title="Reload the app from the home page"
          className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          Back to safety
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
