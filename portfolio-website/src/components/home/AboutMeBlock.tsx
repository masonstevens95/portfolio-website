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
          style={{ aspectRatio: "1 / 1" }}
        />
      </div>

      <div className="px-[22px] py-5" style={{ maxWidth: "52ch" }}>
        <p className="m-0 copy">
          I build software that makes complicated things legible. Garden layout
          software for people doing it themselves. Parsers that turn a binary
          save file into something you can read. Calculators that answer what a
          piece of land actually costs. A VS Code extension that makes a pull
          request reviewable at a glance.
        </p>
        <p className="m-0 mt-4 copy">
          The land part isn&rsquo;t a hobby on the side of that. I grow food,
          and I argue for missing-middle housing and a land value tax in
          Hillsborough, because most people can&rsquo;t see what zoning costs
          them or what a parcel is actually worth. Same problem, different
          tools.
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
