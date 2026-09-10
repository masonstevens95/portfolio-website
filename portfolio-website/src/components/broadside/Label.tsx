/*
  Label.tsx

  Small uppercase tracked label in spruce: article numbers, plate captions,
  kickers, overlines. The kit's label tracking range is 0.10em to 0.16em.
*/

interface Props {
  children: React.ReactNode;
  /** Wider tracking for masthead overlines. */
  tracking?: "normal" | "wide";
  as?: "span" | "p" | "div";
  className?: string;
}

export const Label = ({
  children,
  tracking = "normal",
  as: Tag = "span",
  className = "",
}: Props) => (
  <Tag
    className={`label ${className}`}
    style={tracking === "wide" ? { letterSpacing: "0.28em" } : undefined}
  >
    {children}
  </Tag>
);
