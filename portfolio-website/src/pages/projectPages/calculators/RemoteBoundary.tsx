import { Component, type ErrorInfo, type ReactNode } from "react";
import { OfflineFallback } from "./OfflineFallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Defensive outer boundary for federated remote modules. In the
 * normal layered design, RemoteCrashBoundary catches and discriminates
 * load vs runtime failures itself; this boundary exists as a safety
 * net for anything that escapes it (e.g. errors thrown while rendering
 * the inner fallback). On catch it logs and renders OfflineFallback.
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
      return <OfflineFallback />;
    }
    return this.props.children;
  }
}
