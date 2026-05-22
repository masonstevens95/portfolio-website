import { Link } from "react-router-dom";
import { ProjectPageTemplate } from "./ProjectPageTemplate";

interface ProjectEntry {
  slug: string;
  title: string;
  description: string;
  image?: string;
}

const projects: ProjectEntry[] = [
  {
    slug: "vespucci",
    title: "Vespucci",
    description:
      "A save-file visualizer and explorer for Europa Universalis V.",
    image: "/assets/vespucci.jpg",
  },
  {
    slug: "garibaldi",
    title: "Garibaldi",
    description:
      "A Victoria 3 data visualization platform. Parses binary save files and renders charts for pops, economies, and more.",
    image: "/assets/garibaldi.jpg",
  },
  {
    slug: "calculators",
    title: "Calculators (Microfrontend)",
    description:
      "A standalone calculators app composed into this portfolio at runtime via Module Federation.",
    image: "/assets/calculator_placeholder.jpg",
  },
  {
    slug: "picture-to-pixel-art",
    title: "Picture to Pixel Art (Microfrontend)",
    description:
      "A microfrontend that turns photos into pixel art. Composed into this portfolio at runtime via Module Federation.",
    image: "/assets/pixel_art_placeholder.png",
  },
  {
    slug: "single-line-drawer",
    title: "Photos into Fourier Series Drawings",
    description:
      "Drag and drop .jpegs to turn them into single line drawings, expressable with Fourier Series.",
    image: "/assets/single_line.png",
  },
  {
    slug: "guadalcanal",
    title: "Guadalcanal Project",
    description:
      "An RTS game built in Godot to test the BMAD development method.",
    image: "/assets/guadalcanal_placeholder.jpeg",
  },
  {
    slug: "pr-reader-vscode",
    title: "PR Reader VSCode Extension",
    description:
      "A VS Code extension that visualizes pull requests for fast SDD code review.",
    image: "/assets/vscode_placeholder.png",
  },
  {
    slug: "yarden-diy",
    title: "Yarden.diy",
    description:
      "A garden design tool for DIYers and nurseries. Includes layout tools, plant library, and visual builder.",
    image: "/assets/Yarden_Logo.svg",
  },
  {
    slug: "voice-garden",
    title: "Voice Garden",
    description:
      "A creative voice-powered garden builder using Fourier transforms. Merges math, DSP, and spatial audio concepts.",
  },
  {
    slug: "vicsave-compiler",
    title: "VicSave Compiler",
    description:
      "Backend service that parses Victoria 3 save files into JSON and serves them via a REST API.",
  },
  {
    slug: "hortibase",
    title: "Hortibase",
    description:
      "A plant data backend that scrapes, caches, and serves structured plant information through a public API.",
  },
];

export const ProjectsIndexPage = () => (
  <ProjectPageTemplate
    title="Projects"
    subtitle="Everything that has a page on this site"
  >
    <section className="w-full max-w-4xl mx-auto px-4">
      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              to={`/projects/${project.slug}`}
              className="flex gap-4 items-start p-4 rounded-lg border border-[var(--orchard-moss)]/70 hover:border-[var(--orchard-honey)]/50 hover:bg-[var(--orchard-moss)]/40 transition-colors"
            >
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-32 h-32 object-cover rounded flex-shrink-0 bg-[var(--orchard-moss)]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-32 h-32 rounded flex-shrink-0 bg-[var(--orchard-moss)] border border-[var(--orchard-moss)]/70 flex items-center justify-center text-3xl text-[var(--orchard-cream)]/40 font-semibold"
                >
                  {project.title.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl text-[var(--orchard-cream)] font-semibold mb-1">
                  {project.title}
                </h3>
                <p className="text-[var(--orchard-cream)]/65 mb-2">{project.description}</p>
                <span className="text-sm text-[var(--orchard-honey)]">View project →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </ProjectPageTemplate>
);
