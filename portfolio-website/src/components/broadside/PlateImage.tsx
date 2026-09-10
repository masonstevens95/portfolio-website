/*
  PlateImage.tsx

  An image inside a plate, with an initial-letter fallback when the file is
  missing.

  Images render in full colour. The kit's "no third hue" rule sits in the
  Palette section and governs the ink system — rules, type, linework, fills.
  It does not ask photographs or screenshots to be desaturated, and doing so
  drains the page of the only colour it has.

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
  className?: string;
  /** Font size of the fallback initial. */
  fallbackSize?: string;
}

export const PlateImage = ({
  src,
  title,
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
    />
  );
};
