import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const PrReaderPage = () => (
  <ProjectPageTemplate
    title="PR Reader VSCode Extension"
    subtitle="A VS Code extension that visualizes pull requests for fast SDD code review"
  >
    <section className="w-full mx-auto px-4 text-[var(--ink)] space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">What It Is</h2>

      <p>
        <strong>PR Reader</strong> is a VS Code extension that turns pull
        requests into a fast, focused review surface — built for{" "}
        <em>spec-driven development</em> (SDD) workflows where the spec, the
        plan, and the diff all need to live next to each other.
      </p>

      <p>
        The goal is to keep code review legible at the pace AI-assisted
        development now produces changes, without forcing reviewers to
        bounce between GitHub, the editor, and the spec docs.
      </p>

      <p className="text-sm text-[var(--ink)]">
        Currently in development; no marketplace release yet.
      </p>
    </section>
  </ProjectPageTemplate>
);
