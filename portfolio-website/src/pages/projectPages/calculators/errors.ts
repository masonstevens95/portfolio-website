/**
 * Pattern-matches errors that mean the host should render its own
 * fallback UI instead of trying to lazy-load the remote's error
 * component. Two broad cases:
 *
 *   1. The remote's code never reached the host (chunk fetch failed,
 *      network error, etc.). The remote's CalculatorsLoadError isn't
 *      reachable either, so anything but a host-only fallback would
 *      cascade into a second failure.
 *
 *   2. The remote responded but doesn't have the requested module —
 *      typically because the module was renamed or removed in the
 *      remote and our manifest references are stale. Trying to render
 *      a remote component for an "expected" runtime error is the
 *      wrong UX here; we want the offline-style fallback.
 */
export function isRemoteLoadFailure(error: Error | undefined): boolean {
  if (!error) return false;
  if (error.name === "ChunkLoadError") return true;
  const message = error.message ?? "";
  return (
    // Browser / Vite chunk-fetch failures.
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Loading chunk") ||
    message.includes("Loading CSS chunk") ||
    message.includes("Importing a module script failed") ||
    // @module-federation/runtime errors. The runtime prefixes its
    // throws with "[Module Federation]", so this catches both
    // "does not exist in container" (manifest mismatch / renamed
    // module) and other federation-protocol failures.
    message.includes("[Module Federation]")
  );
}
