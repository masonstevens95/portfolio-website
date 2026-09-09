/*
  FeaturedWorkBlock — Article II

  A plate grid: cells share 4px ink rules, each carrying a caption, an image
  and a title block.

  The hover-to-expand grid this replaced used rounded-2xl, shadow-lg, a
  bottom gradient scrim and text-shadow on every title — four prohibitions in
  one component. Hover is now a spruce title rule, not a color wash.
*/

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PlateCaption, SectionHead, TitleBlock } from "../broadside";

const featuredProjects = [
  {
    title: "Vespucci",
    description:
      "A save-file visualizer and explorer for Europa Universalis V.",
    image: "/assets/vespucci.jpg",
    link: "/projects/vespucci",
  },
  {
    title: "Garibaldi",
    description:
      "A Victoria 3 data visualization platform. Parses binary save files and renders charts for pops, economies, and more.",
    image: "/assets/garibaldi.jpg",
    link: "/projects/garibaldi",
  },
  {
    title: "Calculators (Microfrontend)",
    description:
      "A standalone calculators app composed into this portfolio at runtime via Module Federation. Each tab is a separately deployed module.",
    image: "/assets/calculator_placeholder.jpg",
    link: "/projects/calculators",
  },
  {
    title: "Picture to Pixel Art (Microfrontend)",
    description:
      "A microfrontend that turns photos into pixel art. Composed into this portfolio at runtime via Module Federation.",
    image: "/assets/pixel_art_placeholder.png",
    link: "/projects/picture-to-pixel-art",
  },
  {
    title: "Guadalcanal Project",
    description:
      "An RTS game built in Godot to test the BMAD development method.",
    image: "/assets/guadalcanal_placeholder.jpeg",
    link: "/projects/guadalcanal",
  },
  {
    title: "PR Reader VSCode Extension",
    description:
      "A VS Code extension that visualizes pull requests for fast SDD code review.",
    image: "/assets/vscode_placeholder.png",
    link: "/projects/pr-reader-vscode",
  },
];

const PLATE_NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

export const FeaturedWorkBlock = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // /assets/pixel_art_placeholder.png is referenced but absent from public/.
  // Rather than shipping a broken-image icon, a missing plate falls back to
  // its initial set in the display face.
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const onCardClick = (link: string) => {
    if (!link || link === "#") return;
    if (/^https?:\/\//.test(link)) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  return (
    <section className="mt-14">
      <SectionHead article="II" title="Selected Work" id="FEATURED_WORK" />

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          border: "4px solid var(--ink)",
          gap: "4px",
          background: "var(--ink)",
          gridAutoRows: "1fr",
        }}
      >
        {featuredProjects.map((project, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <button
              key={project.title}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => onCardClick(project.link)}
              className="text-left flex flex-col cursor-pointer"
              style={{ background: "var(--stock)" }}
            >
              <div className="p-3 pb-0 flex-1 flex flex-col">
                {/* Reserve two lines so a caption that wraps does not shift
                    its plate relative to the rest of the row. */}
                <div className="min-h-[2.6em]">
                  <PlateCaption plate={PLATE_NUMERALS[index]}>
                    {project.title}
                  </PlateCaption>
                </div>
                {/* Fixed band rather than an aspect ratio: in a flex column
                    aspect-ratio loses to flex sizing, and plates whose
                    captions wrap to two lines end up shorter than their
                    neighbours. A fixed height keeps every title block on the
                    same line across a row. */}
                <div
                  className="w-full h-48 md:h-56 overflow-hidden"
                  style={{
                    border: `2px solid ${isHovered ? "var(--spruce)" : "var(--ink)"}`,
                  }}
                >
                  {failed[project.title] ? (
                    <div
                      aria-hidden="true"
                      className="display w-full h-full flex items-center justify-center"
                      style={{ fontSize: "clamp(28px, 6vw, 56px)", opacity: 0.25 }}
                    >
                      {project.title.charAt(0)}
                    </div>
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      onError={() =>
                        setFailed((f) => ({ ...f, [project.title]: true }))
                      }
                      className="w-full h-full object-cover"
                      style={{
                        /* Two inks on stock. Screenshots are content, not
                           chrome, so they desaturate into the system and come
                           back to full colour on hover. */
                        filter: isHovered
                          ? "none"
                          : "grayscale(1) contrast(1.05)",
                        transition: "filter 200ms",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="mt-auto pt-3">
                <TitleBlock
                  title={project.title}
                  subtitle={isHovered ? "View project →" : undefined}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="m-0 mt-4">
        <Link to="/projects" className="label no-underline hover:underline">
          View all projects →
        </Link>
      </p>
    </section>
  );
};
