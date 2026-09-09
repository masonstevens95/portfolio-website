/*
  TitleBlock.tsx

  The comp's .tblock: an ink top rule, display title and spruce subtitle on
  the left, tabular meta right-aligned. This is what makes a project card
  read as a plate rather than a storefront tile.
*/

interface Props {
  title: string;
  subtitle?: string;
  /** Keep the subtitle's line reserved when it is hidden, so toggling it
   *  cannot change the block's height. */
  reserveSubtitle?: boolean;
  className?: string;
}

export const TitleBlock = ({
  title,
  subtitle,
  reserveSubtitle = false,
  className = "",
}: Props) => (
  <div
    className={`flex justify-between items-end gap-3 px-3 py-3 ink-frame-top ${className}`}
  >
    <div className="min-w-0">
      <div
        className="display"
        style={{ fontSize: "clamp(18px, 2.4vw, 24px)", lineHeight: 0.9 }}
      >
        {title}
      </div>
      {(subtitle || reserveSubtitle) && (
        <div
          className="label mt-1"
          style={{
            letterSpacing: "0.1em",
            fontWeight: 700,
            visibility: subtitle ? "visible" : "hidden",
          }}
        >
          {subtitle ?? "\u00A0"}
        </div>
      )}
    </div>
  </div>
);
