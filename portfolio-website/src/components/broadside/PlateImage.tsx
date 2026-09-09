/*
  PlateImage.tsx

  An image inside a plate, desaturated into the two-ink system, with an
  initial-letter fallback when the file is missing.

  The fallback is not hypothetical: /assets/pixel_art_placeholder.png is
  referenced by the featured grid and the projects index but absent from
  public/. A broken-image icon reads as a bug; a set initial reads as a plate
  awaiting its illustration.
*/

import { useState } from "react";

interface Props {
  src?: string;
  /** Falls back to this word's first letter, and labels the image. */
  title: string;
  /** Full colour on hover. Off by default — screenshots are content, not chrome. */
  colour?: boolean;
  className?: string;
  /** Font size of the fallback initial. */
  fallbackSize?: string;
}

export const PlateImage = ({
  src,
  title,
  colour = false,
  className = "",
  fallbackSize = "clamp(28px, 6vw, 56px)",
}: Props) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`display w-full h-full flex items-center justify-center ${className}`}
        style={{ fontSize: fallbackSize, opacity: 0.25 }}
      >
        {title.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
      style={{
        filter: colour ? "none" : "grayscale(1) contrast(1.05)",
        transition: "filter 200ms",
      }}
    />
  );
};
