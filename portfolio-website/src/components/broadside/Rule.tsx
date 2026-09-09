/*
  Rule.tsx

  The broadside's divider. Heavy (5px) or thin (2px), ink or spruce.
  Nothing else in the site should draw a border-bottom to separate sections —
  rules are the load-bearing structural device, not decoration.
*/

interface Props {
  weight?: "heavy" | "thin";
  ink?: "black" | "spruce";
  className?: string;
}

export const Rule = ({
  weight = "heavy",
  ink = "black",
  className = "",
}: Props) => (
  <hr
    aria-hidden="true"
    className={`border-none m-0 w-full ${className}`}
    style={{
      height: weight === "heavy" ? "var(--rule-heavy)" : "var(--rule-thin)",
      background: ink === "spruce" ? "var(--spruce)" : "var(--ink)",
    }}
  />
);
