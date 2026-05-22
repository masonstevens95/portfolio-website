/*
  FeaturedWorkBlock.tsx
*/

import { ParallaxLayer } from "@react-spring/parallax";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

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

const COLS = 3;
const ROWS = 2;

const buildTracks = (count: number, hoveredTrack: number | null): string =>
  Array.from({ length: count }, (_, i) =>
    hoveredTrack === null ? "1fr" : i === hoveredTrack ? "2.5fr" : "0.75fr"
  ).join(" ");

export const FeaturedWorkBlock = ({ offset, speed, factor }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const hoveredCol = hoveredIndex !== null ? hoveredIndex % COLS : null;
  const hoveredRow =
    hoveredIndex !== null ? Math.floor(hoveredIndex / COLS) : null;

  const onCardClick = (link: string) => {
    if (!link || link === "#") return;
    if (/^https?:\/\//.test(link)) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  return (
    <ParallaxLayer
      aria-description="Featured work section with hover-to-expand projects"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center px-10 flex flex-col">
        <h1 className="text-5xl font-bold mb-12 text-[var(--orchard-cream)]">Featured Work</h1>
        <div
          className="grid w-full max-w-7xl h-3/4 overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-in-out"
          style={{
            gridTemplateColumns: buildTracks(COLS, hoveredCol),
            gridTemplateRows: buildTracks(ROWS, hoveredRow),
          }}
        >
          {featuredProjects.map((project, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onCardClick(project.link)}
                className="transition-all duration-500 ease-in-out cursor-pointer relative group overflow-hidden bg-[var(--orchard-bark)]/45"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="object-cover w-full h-full absolute inset-0 z-0 opacity-75 group-hover:opacity-95 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--orchard-bark)] via-[var(--orchard-bark)]/70 to-transparent p-4 z-10">
                  <h3 className="text-xl text-[var(--orchard-cream)] font-semibold [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">
                    {project.title}
                  </h3>
                  {isHovered && (
                    <p className="text-sm text-[var(--orchard-cream)]/85 mt-2 transition-opacity duration-300 [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Link
          to="/projects"
          className="mt-6 text-[var(--orchard-honey)]/80 hover:text-[var(--orchard-honey)] text-base md:text-lg underline-offset-4 hover:underline transition-colors"
        >
          View all projects →
        </Link>
      </div>
    </ParallaxLayer>
  );
};
