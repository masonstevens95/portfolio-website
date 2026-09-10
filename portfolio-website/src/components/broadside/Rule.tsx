/*
  Rule.tsx

  The broadside's divider. Heavy or thin, ink or spruce.

  Both weights are 1px on screen. Rule weight is proportional to the surface,
  not absolute: print and plan sheets use 5px + 2px, and carrying those
  numbers to a 1000px viewport lands about 4x too heavy. The weight/thin
  distinction is kept so the same primitive can serve a print surface.
  See brand-kit.md, "On screen".

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
      // The accent rule sits back so the pair reads as one device, not two
      // competing lines. Per web-tokens.css `.rule.spruce`.
      opacity: ink === "spruce" ? 0.55 : undefined,
    }}
  />
);
