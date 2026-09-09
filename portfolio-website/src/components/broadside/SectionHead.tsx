/*
  SectionHead.tsx

  The comp's .sec-head: a spruce ARTICLE numeral baseline-aligned against a
  condensed display title.

  Owns the section's anchor id as well as its heading, so section identity
  and section heading stay in one place and the nav has a single thing to
  target.
*/

import { Label } from "./Label";

interface Props {
  /** Roman numeral, e.g. "I". Rendered as "ARTICLE I". */
  article: string;
  title: string;
  /** Anchor target for nav links. */
  id?: string;
  className?: string;
}

export const SectionHead = ({ article, title, id, className = "" }: Props) => (
  <div
    id={id}
    className={`flex flex-wrap items-baseline gap-3 mb-4 scroll-mt-24 ${className}`}
  >
    <Label>Article {article}</Label>
    <h2
      className="display m-0"
      style={{ fontSize: "clamp(24px, 4vw, 38px)", letterSpacing: "0.01em" }}
    >
      {title}
    </h2>
  </div>
);
