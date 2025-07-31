/*
  ProfessionalGoalsBlock.tsx
*/

import { ParallaxLayer } from "@react-spring/parallax";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

export const ProfessionalGoalsBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer
      aria-description="Professional goals and aspirations section"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="bg-black/30 rounded-3xl shadow-xl backdrop-blur-md p-10 max-w-4xl w-full text-center">
          <h1 className="text-5xl font-bold text-neutral-100 mb-6">
            Where I'm Headed
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            My long-term goal is to bridge the gap between technology and the
            natural world through spatial tools, intuitive design, and
            sustainable systems. I'm particularly interested in:
          </p>

          <ul className="mt-6 text-left text-neutral-200 space-y-3 list-disc list-inside">
            <li>
              🌱 Building intelligent, interactive tools for outdoor spaces
            </li>
            <li>🧠 Leveraging AI/ML to assist with climate-conscious design</li>
            <li>
              🛠 Developing accessible, visual interfaces for non-technical users
            </li>
            <li>
              🤝 Collaborating on mission-driven projects with environmental
              impact
            </li>
          </ul>

          <p className="text-neutral-400 text-md mt-6">
            I’m always open to connecting with folks building tools for the real
            world.
          </p>
        </div>
      </div>
    </ParallaxLayer>
  );
};
