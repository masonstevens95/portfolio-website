import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";

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
 * to load (network blip mid-session). Renders a minimal host-side
 * fallback so that doesn't bubble up to the outer RemoteBoundary
 * (whose "offline" message would be misleading at that point).
 */
class ErrorComponentBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-neutral-400 text-center py-8">
          Something went wrong rendering this calculator.
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Inner boundary for federated remote modules. Catches errors thrown
 * by the remote AFTER it has loaded (calc threw at runtime). Falls
 * back to the remote's own CalculatorsLoadError component.
 */
export class RemoteCrashBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Calculators remote runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorComponentBoundary>
          <Suspense
            fallback={
              <div className="text-neutral-400 text-center py-8">
                Something went wrong.
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
