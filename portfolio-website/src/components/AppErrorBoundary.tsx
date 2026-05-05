import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * App-root error boundary. The route-level boundaries (RemoteBoundary,
 * RemoteCrashBoundary, etc.) handle expected failure modes inside
 * specific subtrees. This one is the safety net for anything that
 * escapes them — an unexpected render error renders a friendly
 * recovery UI instead of a blank page.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App-level error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen w-full bg-neutral-900 text-neutral-100 flex items-center justify-center px-4"
        >
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-neutral-300 mb-6">
              An unexpected error happened. Try reloading the page; the full
              error has been logged to the browser console.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded hover:bg-white transition-colors font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
