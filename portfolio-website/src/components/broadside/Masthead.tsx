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
      style={{ fontSize: "clamp(46px, 13vw, 124px)" }}
    >
      {wordmark}
    </h1>
    {motto && (
      <p
        className="label m-0 mt-3"
        style={{
          fontSize: "clamp(12px, 2vw, 16px)",
          letterSpacing: "0.12em",
        }}
      >
        {motto}
      </p>
    )}
    {estd && (
      <p
        className="m-0 mt-1 uppercase opacity-55"
        style={{ fontSize: "10.5px", letterSpacing: "0.28em" }}
      >
        {estd}
      </p>
    )}
  </header>
);
