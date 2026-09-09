/*
  DoubleRule.tsx

  Heavy rule paired with a thin one, 3px apart. The site's primary section
  divider and page frame. Either rule may be spruce; both are never spruce,
  because spruce is an accent and not a fill.
*/

import { Rule } from "./Rule";

interface Props {
  /** Which of the pair is spruce. The kit allows either; the site uses the
   *  lower rule so the ink line leads. "none" is for a plain divider. */
  accent?: "none" | "top" | "bottom";
  className?: string;
}

export const DoubleRule = ({ accent = "bottom", className = "" }: Props) => (
  <div
    className={`flex flex-col w-full ${className}`}
    style={{ gap: "var(--rule-gap)" }}
  >
    <Rule weight="heavy" ink={accent === "top" ? "spruce" : "black"} />
    <Rule weight="thin" ink={accent === "bottom" ? "spruce" : "black"} />
  </div>
);
