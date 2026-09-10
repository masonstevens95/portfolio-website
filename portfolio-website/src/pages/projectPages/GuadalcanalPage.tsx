import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const GuadalcanalPage = () => (
  <ProjectPageTemplate
    title="Guadalcanal Project"
    subtitle="An RTS game built in Godot to test the BMAD development method"
  >
    <section className="w-full mx-auto px-4 text-[var(--ink)] space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">What It Is</h2>

      <p>
        <strong>Guadalcanal</strong> is a real-time strategy game I'm building
        in <em>Godot</em>, set during the Pacific theater campaign on the
        Solomon Islands.
      </p>

      <p>
        The project doubles as a sandbox for the{" "}
        <strong>BMAD method</strong> (Breakthrough Method for Agile AI-Driven
        Development) — exploring how agentic-AI workflows hold up across the
        full lifecycle of a non-trivial game project: design briefs, gameplay
        prototyping, asset pipelines, and iteration.
      </p>

      <p className="text-sm text-[var(--ink)]">
        Currently in active development; no public release yet.
      </p>
    </section>
  </ProjectPageTemplate>
);
