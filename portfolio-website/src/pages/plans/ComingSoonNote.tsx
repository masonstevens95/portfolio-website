/*
  The honest launch state: no plan is for sale yet, so say so and say how to
  hear about it, rather than showing a storefront with nothing to do.
*/

import { mailtoContact } from "../../data/site";

interface Props {
  /** Plan-specific wording on a detail page; generic on the index. */
  planTitle?: string;
}

export const ComingSoonNote = ({ planTitle }: Props) => (
  <p className="m-0 copy" style={{ fontSize: "15px", lineHeight: 1.55, maxWidth: "60ch" }}>
    {planTitle ? `The ${planTitle} plans are` : "Plans are"} being drawn alongside the
    build videos and aren&rsquo;t for sale yet.{" "}
    <a
      href={mailtoContact(planTitle ? `Plans: ${planTitle}` : "Plans")}
      className="underline"
    >
      Write to me
    </a>{" "}
    to hear when {planTitle ? "they're" : "the first set is"} ready.
  </p>
);
