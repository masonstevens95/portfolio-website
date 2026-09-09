/*
  ContactBlock — Article III

  The honey pill button and its translucent surround are gone; the address is
  a bordered ink block.

  NOTE: the previous version shipped a live `mailto:youremail@example.com`
  placeholder. CONTACT_EMAIL below is the one line to change if a different
  address should be public.
*/

import { SectionHead } from "../broadside";

const CONTACT_EMAIL = "mason.c.stevens@gmail.com";
const GITHUB = "https://github.com/masonstevens95";

export const ContactBlock = () => (
  <section className="mt-14">
    <SectionHead article="III" title="Contact" id="CONTACT" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
      <div style={{ maxWidth: "42ch" }}>
        <p className="m-0 copy">
          If you want to collaborate on something, have a question about any of
          the work above, or just want to say hello &mdash; write to me.
        </p>
      </div>

      <div className="flex flex-col gap-3 items-start">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="display no-underline hover:opacity-70 transition-opacity"
          style={{ fontSize: "clamp(17px, 2.2vw, 22px)" }}
        >
          {CONTACT_EMAIL}
        </a>
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="label no-underline hover:underline"
        >
          GitHub &rarr;
        </a>
      </div>
    </div>
  </section>
);
