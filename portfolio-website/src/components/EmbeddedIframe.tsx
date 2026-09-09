interface Props {
  src: string;
  /** Used as the iframe `title` attribute and as the aria-label for the
   * open-in-new-tab escape link. Should describe what the embedded site
   * is — e.g. "Calculators (live demo)". */
  title: string;
}

/**
 * Generic live-site embed, framed as a mounted plate.
 *
 * The embedded app is separately deployed and owns its own styling, so it
 * will not match the broadside. Giving it a hard ink frame and a plate
 * caption makes that discontinuity read as a deliberate exhibit rather than
 * a broken page.
 */
export function EmbeddedIframe({ src, title }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline gap-4 mb-2">
        <p className="label m-0">Plate — {title}, live</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${title} in a new tab`}
          className="label no-underline hover:underline"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="w-full h-[calc(100vh-280px)] min-h-[500px]"
        style={{ border: "4px solid var(--ink)", background: "var(--stock)" }}
      />
    </div>
  );
}
