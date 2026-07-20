import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Action Command Center render failed', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-failure" role="alert">
          <p className="eyebrow">Local workspace unavailable</p>
          <h1>Your work is still on this device.</h1>
          <p>
            The command center could not finish loading. Refresh to retry; no
            external action was attempted.
          </p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry loading
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
