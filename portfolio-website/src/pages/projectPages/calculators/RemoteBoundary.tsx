import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Outer boundary for federated remote modules. Catches load failures
 * (network errors, ChunkLoadError) — i.e. the case where the remote's
 * code never reaches the host. Cannot rely on remote-provided error
 * components here; they haven't loaded.
 */
export class RemoteBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Calculators remote failed to load:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full mx-auto px-4 py-12 text-center text-neutral-300">
          <h2 className="text-2xl font-bold text-neutral-100 mb-2">
            This demo is offline
          </h2>
          <p>
            The calculators microfrontend couldn't be loaded. View it live at{" "}
            <a
              href="https://calculators-two-alpha.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              calculators-two-alpha.vercel.app
            </a>
            .
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
