import { lazy, Suspense, useMemo, type ComponentType } from "react";
import { RemoteBoundary } from "./RemoteBoundary";
import { RemoteCrashBoundary } from "./RemoteCrashBoundary";

interface Props {
  importer: () => Promise<{ default: ComponentType }>;
}

/**
 * Lazy-loads a federated remote module and wraps it with the layered
 * error boundaries. The lazy component is memoized on the importer
 * identity so re-renders don't re-create it (which would re-fetch).
 */
export function RemoteTab({ importer }: Props) {
  const LazyComponent = useMemo(() => lazy(importer), [importer]);

  return (
    <RemoteBoundary>
      <Suspense
        fallback={
          <div className="text-[var(--orchard-cream)]/65 text-center py-8">Loading…</div>
        }
      >
        <RemoteCrashBoundary>
          <LazyComponent />
        </RemoteCrashBoundary>
      </Suspense>
    </RemoteBoundary>
  );
}
