/*
  TitleBlock.tsx

  The comp's .tblock: an ink top rule, display title and spruce subtitle on
  the left, tabular meta right-aligned. This is what makes a project card
  read as a plate rather than a storefront tile.
*/

interface Props {
  title: string;
  subtitle?: string;
  /** Right-aligned meta — figures render tabular. */
  meta?: string;
  className?: string;
}

export const TitleBlock = ({
  title,
  subtitle,
  meta,
  className = "",
}: Props) => (
  <div
    className={`flex justify-between items-end gap-3 px-3 py-3 ${className}`}
    style={{ borderTop: "4px solid var(--ink)" }}
  >
    <div className="min-w-0">
      <div
        className="display"
        style={{ fontSize: "clamp(18px, 2.4vw, 24px)", lineHeight: 0.9 }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          className="label mt-1"
          style={{ letterSpacing: "0.1em", fontWeight: 700 }}
        >
          {subtitle}
        </div>
      )}
    </div>
    {meta && (
      <div
        className="data shrink-0 text-right"
        style={{
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {meta}
      </div>
    )}
  </div>
);
