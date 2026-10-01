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
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] ink-frame">
      <div className="p-[18px] border-b md:border-b-0 md:border-r border-[var(--ink)]">
        <img
          src="/assets/profile_new.jpeg"
          alt="Mason Stevens"
          className="w-full object-cover ink-frame md:h-full"
          style={{ aspectRatio: "4 / 5" }}
        />
      </div>

      <div className="px-[22px] py-[18px]">
        <p className="m-0 copy">
          I build software that makes complicated things legible, because I like
          seeing how the pieces fit. Garden layout software for people doing it
          themselves. Software that makes strategy games even more strategic.
          Calculators that answer what land (should) cost. A VS Code extension
          that makes a pull request reviewable at a glance. I&rsquo;d rather
          build the tool than wait for one, and I love a good chart.
        </p>
        <p className="m-0 mt-4 copy">
          The land part isn&rsquo;t a hobby on the side of that. I&rsquo;m
          building a food forest, a perennial system where each plant does a job
          for its neighbors, and I argue for missing-middle housing and a land
          value tax in Hillsborough, because most people can&rsquo;t see what
          zoning costs them or what a parcel is worth. It&rsquo;s all systems
          thinking: find the feedback loops, and take advantage of that.
        </p>
        <p className="m-0 mt-4 copy">
          Away from the screen I mountain bike, climb rocks, and play strategy
          games. Reading a line, a route, or a board and planning several moves
          ahead is the same muscle.
        </p>
      </div>
    </div>
  </section>
);
