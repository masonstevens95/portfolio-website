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
    {/* Three columns so the plate is filled rather than trailing 250px of dead
        space to the right of a 52ch measure. The right column is a title
        block, which is the kit's own device for exactly this. */}
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,220px)_1fr_minmax(0,190px)] ink-frame">
      <div className="p-[18px] border-b md:border-b-0 md:border-r border-[var(--ink)]">
        <img
          src="/assets/profile_new.jpeg"
          alt="Mason Stevens"
          className="w-full object-cover ink-frame"
          style={{ aspectRatio: "4 / 5" }}
        />
      </div>

      <div className="px-[22px] py-5">
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
      </div>

      <dl className="p-[18px] m-0 border-t md:border-t-0 md:border-l border-[var(--ink)]">
        <dt className="label m-0">Location</dt>
        <dd className="m-0 mt-1" style={{ fontSize: "13px" }}>
          Hillsborough, N.C.
        </dd>
        <dt className="label m-0 mt-4">Discipline</dt>
        <dd className="m-0 mt-1" style={{ fontSize: "13px" }}>
          UX · Frontend · Spatial
        </dd>
      </dl>
    </div>
  </section>
);
