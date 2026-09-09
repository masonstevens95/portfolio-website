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
          className="min-h-screen w-full flex items-center justify-center px-4"
          style={{ background: "var(--stock)", color: "var(--ink)" }}
        >
          <div
            className="max-w-md p-6 ink-frame"
          >
            <p className="label m-0 mb-3">Notice</p>
            <h1 className="display m-0 mb-3" style={{ fontSize: "34px" }}>
              Something went wrong
            </h1>
            <p className="m-0 mb-5" >
              An unexpected error happened. Try reloading the page; the full
              error has been logged to the browser console.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="label px-4 py-2"
              style={{ border: "2px solid var(--spruce)" }}
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
