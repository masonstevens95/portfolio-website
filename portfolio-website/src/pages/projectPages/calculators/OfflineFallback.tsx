/**
 * Host-side fallback shown when the calculators remote can't load
 * (chunk fetch failure, network error, Vercel cold start, etc.).
 * Rendered without any remote dependency, since by definition the
 * remote's own error component is unavailable in this case.
 */
export const OfflineFallback = () => (
  <div
    role="alert"
    className="w-full mx-auto px-4 py-12 text-center text-[var(--orchard-cream)]/80"
  >
    <h2 className="text-2xl font-bold text-[var(--orchard-cream)] mb-2">
      This demo is offline
    </h2>
    <p>
      The calculators microfrontend couldn't be loaded. View it live at{" "}
      <a
        href="https://calculators-two-alpha.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--orchard-cream)]"
      >
        calculators-two-alpha.vercel.app
      </a>
      .
    </p>
  </div>
);
