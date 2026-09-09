import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { OfflineFallback } from "./OfflineFallback";
import { isRemoteLoadFailure } from "./errors";

const CalculatorsLoadError = lazy(
  () => import("calculators/CalculatorsLoadError")
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Sub-boundary used when even the remote's CalculatorsLoadError fails
 * to load. Renders a minimal host-side fallback so that doesn't bubble
 * up unhandled.
 */
class ErrorComponentBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(
      "Calculators error component failed to load:",
      error,
      errorInfo
    );
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-[var(--ink)] text-center py-8">
          Something went wrong rendering this calculator.
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Inner boundary for federated remote modules. Two distinct fallback
 * paths based on the captured error:
 *   - Remote-load failure (ChunkLoadError, dynamic-import rejection):
 *     render OfflineFallback. The remote's own error UI is unreachable
 *     in this case, so we never try to load it.
 *   - Runtime error from an already-loaded remote: lazy-load the
 *     remote's CalculatorsLoadError, with a sub-boundary in case the
 *     error UI itself fails to load mid-session.
 *
 * This single boundary handles both cases because two stacked
 * boundaries cannot route by error type — the inner one always
 * catches first regardless of nesting.
 */
export class RemoteCrashBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isRemoteLoadFailure(error)) {
      console.error("Calculators remote failed to load:", error, errorInfo);
    } else {
      console.error("Calculators remote runtime error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (isRemoteLoadFailure(this.state.error)) {
        return <OfflineFallback />;
      }
      return (
        <ErrorComponentBoundary>
          <Suspense
            fallback={
              <div className="text-[var(--ink)] text-center py-8">
                Showing error details…
              </div>
            }
          >
            <CalculatorsLoadError error={this.state.error} />
          </Suspense>
        </ErrorComponentBoundary>
      );
    }
    return this.props.children;
  }
}
