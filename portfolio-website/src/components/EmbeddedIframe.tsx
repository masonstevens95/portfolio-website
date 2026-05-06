interface Props {
  src: string;
  /** Used as the iframe `title` attribute and as the aria-label for the
   * open-in-new-tab escape link. Should describe what the embedded site
   * is — e.g. "Calculators (live demo)". */
  title: string;
}

/**
 * Generic live-site embed: a thin "Open in new tab ↗" link plus an
 * iframe that fills most of the visible viewport. Used for project
 * pages that just want to host a separately deployed app inside the
 * portfolio chrome.
 */
export function EmbeddedIframe({ src, title }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${title} in a new tab`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="w-full h-[calc(100vh-280px)] min-h-[500px] bg-neutral-950 border border-neutral-700 rounded-lg"
      />
    </div>
  );
}
