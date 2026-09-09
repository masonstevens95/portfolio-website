import { Link } from "react-router-dom";
import { ProjectPageTemplate } from "./ProjectPageTemplate";
import { PlateCaption, PlateImage, Rule } from "../components/broadside";

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

export const ProjectsIndexPage = () => {
  return (
    <ProjectPageTemplate
      title="Projects"
      subtitle="Everything that has a page on this site"
    >
      <section className="w-full">
        {/* The index is the site's one genuinely ordered sequence, so plate
            numbering is legitimate here. The kit permits numbering only where
            order is real. */}
        <ul className="list-none p-0 m-0 ink-frame">
          {projects.map((project, index) => (
            <li key={project.slug}>
              {index > 0 && <Rule weight="thin" />}
              <Link
                to={`/projects/${project.slug}`}
                className="flex gap-5 items-start p-4 no-underline group"
                style={{ color: "var(--ink)" }}
              >
                <div className="w-28 h-28 shrink-0 overflow-hidden ink-frame">
                  <PlateImage
                    src={project.image}
                    title={project.title}
                    fallbackSize="40px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <PlateCaption>{`No. ${index + 1}`}</PlateCaption>
                  <h3
                    className="display m-0 mb-1"
                    style={{ fontSize: "clamp(18px, 2.4vw, 24px)" }}
                  >
                    {project.title}
                  </h3>
                  <p className="m-0 mb-2" style={{ fontSize: "14px", lineHeight: 1.5 }}>
                    {project.description}
                  </p>
                  <span className="label group-hover:underline">
                    View project &rarr;
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ProjectPageTemplate>
  );
};
