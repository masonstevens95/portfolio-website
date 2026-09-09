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
  <section className="mt-[52px]">
    <SectionHead article="III" title="Contact" id="CONTACT" />

    <div className="grid grid-cols-1 md:grid-cols-2 ink-frame">
      <div className="px-[22px] py-5" style={{ maxWidth: "44ch" }}>
        <p className="m-0 copy">
          If you want to collaborate on something, have a question about any of
          the work above, or just want to say hello &mdash; write to me.
        </p>
      </div>

      <div className="px-[22px] py-5 flex flex-col gap-3 items-start border-t md:border-t-0 md:border-l border-[var(--ink)]">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="display no-underline hover:opacity-70 transition-opacity"
          style={{ fontSize: "21px" }}
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
