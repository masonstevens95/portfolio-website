/*
  AboutMeBlock — Article I

  Hard-bordered two-column plate. The frosted card it replaced used a soft
  corner radius, a drop shadow, a blurred backdrop and a translucent fill —
  all four prohibited by the brand.
*/

import { SectionHead } from "../broadside";

export const AboutMeBlock = () => (
  <section className="mt-[52px]">
    <SectionHead article="I" title="About" id="ABOUT_ME" />

    {/* Hairline plate. The kit rules out *filled boxes*, not frames — at 1px
        the frame is a drawn member, which is the point. */}
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,220px)_1fr] ink-frame">
      <div className="p-[18px] border-b md:border-b-0 md:border-r border-[var(--ink)]">
        <img
          src="/assets/profile_new.jpeg"
          alt="Mason Stevens"
          className="w-full object-cover ink-frame"
          style={{
            aspectRatio: "1 / 1",
            /* Two inks on stock. A full-colour photograph is a third hue;
               grayscale keeps it inside the system without hiding it. */
            filter: "grayscale(1) contrast(1.05)",
          }}
        />
      </div>

      <div className="px-[22px] py-5" style={{ maxWidth: "52ch" }}>
        <p className="m-0 copy">
          I&rsquo;m a designer and developer building tools that connect people
          to plants and to the ground they stand on. Garden layout software,
          save-file parsers, land calculators, a VS Code extension for reading
          pull requests. The through-line is making something legible that
          wasn&rsquo;t before.
        </p>
        <p className="m-0 mt-4 copy">
          Outside of work I&rsquo;m in the orchard, arguing for missing-middle
          housing and a land value tax in Hillsborough, or on a mountain bike
          somewhere in the Piedmont.
        </p>
        <p
          className="label m-0 mt-5"
          style={{ letterSpacing: "0.13em", fontWeight: 600 }}
        >
          Hillsborough, N.C. · UX · Frontend · Spatial
        </p>
      </div>
    </div>
  </section>
);
