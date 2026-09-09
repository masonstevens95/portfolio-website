/*
  AboutMeBlock — Article I

  Hard-bordered two-column plate. The frosted card it replaced used,, and a translucent fill, all four of
  which the brand prohibits.
*/

import { SectionHead } from "../broadside";

export const AboutMeBlock = () => (
  <section className="mt-14">
    <SectionHead article="I" title="About" id="ABOUT_ME" />

    <div
      className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_1fr] ink-frame"
    >
      <div className="p-5 flex items-start justify-center border-b-4 md:border-b-0 md:border-r-4 border-[var(--ink)]">
        <img
          src="/assets/profile_new.jpeg"
          alt="Mason Stevens"
          className="w-full max-w-[200px] object-cover ink-frame"
          style={{
            aspectRatio: "1 / 1",
            /* Two inks on stock. A full-colour photograph is a third hue;
               grayscale keeps it inside the system without hiding it. */
            filter: "grayscale(1) contrast(1.05)",
          }}
        />
      </div>

      <div className="p-5" style={{ maxWidth: "48ch" }}>
        <p className="m-0" >
          I&rsquo;m a designer and developer building tools that connect people
          to plants and to the ground they stand on. Garden layout software,
          save-file parsers, land calculators, a VS Code extension for reading
          pull requests. The through-line is making something legible that
          wasn&rsquo;t before.
        </p>
        <p className="m-0 mt-4" >
          Outside of work I&rsquo;m in the orchard, arguing for missing-middle
          housing and a land value tax in Winston-Salem, or on a mountain bike
          somewhere in the Piedmont.
        </p>
        <p className="data m-0 mt-5" style={{ fontSize: "12px" }}>
          Winston-Salem, N.C. · UX · Frontend · Spatial
        </p>
      </div>
    </div>
  </section>
);
