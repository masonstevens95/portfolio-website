/*
  FeaturedWorkBlock.tsx
*/

import { ParallaxLayer } from "@react-spring/parallax";
import { useState } from "react";

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
  },
  {
    title: "Plant Library",
    description:
      "Browse hundreds of plants with care instructions and climate data.",
    image: "/assets/project-library.jpg",
  },
  {
    title: "Water Usage Tracker",
    description: "Monitor and reduce water usage in your garden over time.",
    image: "/assets/project-water.jpg",
  },
];

export const FeaturedWorkBlock = ({ offset, speed, factor }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <ParallaxLayer
      aria-description="Featured work section with interactive projects"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center px-10">
        <div className="flex w-full max-w-7xl h-3/4 overflow-hidden rounded-2xl shadow-lg">
          {featuredProjects.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={index}
                className={`transition-all duration-500 ease-in-out cursor-pointer relative group overflow-hidden ${
                  isActive ? "flex-[3]" : "flex-[1]"
                } h-full bg-black/30 hover:flex-[2]`}
                onClick={() => setActiveIndex(index)}
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
                  {isActive && (
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
