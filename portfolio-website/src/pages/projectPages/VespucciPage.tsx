import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const VespucciPage = () => (
  <ProjectPageTemplate
    title="Vespucci"
    subtitle="A save-file visualizer and explorer for Europa Universalis V"
  >
    <section className="w-full mx-auto px-4 text-[var(--ink)] space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">What It Is</h2>

      <p>
        <strong>Vespucci</strong> is a web application for analyzing and
        visualizing save files from <em>Europa Universalis V</em>. Players
        upload their save files and explore country data, diplomacy, and
        historical timelines through an interactive UI.
      </p>

      <p>
        Inspired by tools like{" "}
        <a
          href="https://www.skanderbeg.pm"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[var(--ink)]"
        >
          Skanderbeg.pm
        </a>
        , the project focuses on making the dense data inside EU5 save files
        browsable — turning raw game state into something you can actually
        explore and share.
      </p>

      <p>
        Try it live:{" "}
        <a
          href="https://vespucci-eu5.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--spruce)] underline hover:text-[var(--ink)]"
        >
          vespucci-eu5.vercel.app
        </a>
      </p>

      <p className="text-sm text-[var(--ink)]">
        Named after Amerigo Vespucci — the explorer whose voyages gave the
        Americas their name; a fitting nod to the age of exploration at the
        heart of Europa Universalis.
      </p>
    </section>
  </ProjectPageTemplate>
);
