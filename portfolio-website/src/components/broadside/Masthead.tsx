/*
  Masthead.tsx

  Overline / wordmark / motto / estd line, centered. Per .mast in the locked
  comp.

  The motto is the one line that does not transfer unchanged from the brand.
  The kit's motto — "The land belongs to all of us." — belongs to the writing
  side of the brand and is not true of a software portfolio, so this component
  takes it as a prop rather than hard-coding one.
*/

import { Label } from "./Label";

interface Props {
  overline?: string;
  wordmark: string;
  motto?: string;
  /** e.g. "Winston-Salem, N.C. · No. 1" */
  estd?: string;
}

export const Masthead = ({ overline, wordmark, motto, estd }: Props) => (
  <header className="text-center pt-6 pb-4">
    {overline && (
      <Label as="p" tracking="wide" className="m-0 mb-3">
        {overline}
      </Label>
    )}
    <h1
      className="display my-2"
      style={{ fontSize: "clamp(38px, 8vw, 76px)" }}
    >
      {wordmark}
    </h1>
    {motto && (
      /* Italic, sentence case, no quote marks. Set bold-uppercase-tracked it
         becomes the loudest element on the page and inverts the hierarchy the
         wordmark is supposed to own. See brand-kit.md, "Motto line". */
      <p
        className="m-0 mt-4 italic"
        style={{
          fontSize: "14px",
          letterSpacing: 0,
          color: "var(--spruce)",
        }}
      >
        {motto}
      </p>
    )}
    {estd && (
      <p
        className="m-0 mt-2.5 uppercase opacity-45"
        style={{ fontSize: "10px", letterSpacing: "0.22em" }}
      >
        {estd}
      </p>
    )}
  </header>
);
