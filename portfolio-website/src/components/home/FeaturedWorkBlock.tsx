/*
  FeaturedWorkBlock.tsx
*/

import { ParallaxLayer } from "@react-spring/parallax";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

const featuredProjects = [
  {
    title: "Yarden.diy",
    description:
      "A garden design tool for DIYers and nurseries. Includes layout tools, plant library, and visual builder. Still evolving.",
    image: "/assets/Yarden_Logo.svg",
    link: "/projects/yarden-diy",
  },
  {
    title: "Garibaldi",
    description:
      "A Victoria 3 data visualization platform. Parses binary save files and renders charts for pops, economies, and more.",
    image: "/assets/garibaldi.jpg",
    link: "/projects/garibaldi",
  },
  {
    title: "Voice Garden",
    description:
      "A creative voice-powered garden builder using Fourier transforms. Merges math, DSP, and spatial audio concepts.",
    image: "/assets/project-voice.jpg",
    link: "/projects/voice-garden",
  },
  {
    title: "VicSave Compiler",
    description:
      "Backend service that parses Victoria 3 save files into JSON and serves them via a REST API. Built for data exploration tools.",
    image: "/assets/project-vicsave.jpg",
    link: "/projects/vicsave-compiler",
  },
  {
    title: "Hortibase",
    description:
      "A plant data backend that scrapes, caches, and serves structured plant information through a public API.",
    image: "/assets/project-hortibase.jpg",
    link: "/projects/hortibase",
  },
];

export const FeaturedWorkBlock = ({ offset, speed, factor }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <ParallaxLayer
      aria-description="Featured work section with hover-to-expand projects"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center px-10">
        <div className="flex w-full max-w-7xl h-3/4 overflow-hidden rounded-2xl shadow-lg">
          {featuredProjects.map((project, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => navigate(project.link)}
                className={`transition-all duration-500 ease-in-out cursor-pointer relative group overflow-hidden ${
                  isHovered
                    ? "flex-[3]"
                    : hoveredIndex === null
                    ? "flex-[1]"
                    : "flex-[0.5]"
                } h-full bg-black/30`}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="object-cover w-full h-full absolute inset-0 z-0 opacity-75 group-hover:opacity-95 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4 z-10">
                  <h3 className="text-xl text-white font-semibold">
                    {project.title}
                  </h3>
                  {isHovered && (
                    <p className="text-sm text-neutral-300 mt-2 transition-opacity duration-300">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ParallaxLayer>
  );
};
