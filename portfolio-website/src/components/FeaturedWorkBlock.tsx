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
    title: "Garden Planner",
    description: "A 3D interactive tool to plan your backyard garden layout.",
    image: "/assets/project-garden.jpg",
    link: "/projects/garden-planner",
  },
  {
    title: "Plant Library",
    description:
      "Browse hundreds of plants with care instructions and climate data.",
    image: "/assets/project-library.jpg",
    link: "/projects/plant-library",
  },
  {
    title: "Water Usage Tracker",
    description: "Monitor and reduce water usage in your garden over time.",
    image: "/assets/project-water.jpg",
    link: "/projects/water-tracker",
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
                  className="object-cover w-full h-full absolute inset-0 z-0 opacity-50 group-hover:opacity-70 transition-opacity"
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
