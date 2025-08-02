/*
  AboutMeBlock.tsx
*/

import { ParallaxLayer } from "@react-spring/parallax";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

export const AboutMeBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer
      aria-description="About the creator of Yarden"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="bg-black/30 rounded-3xl shadow-lg backdrop-blur-md p-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8">
          <img
            src="/assets/profile.jpg" // replace with your actual profile path
            alt="Profile photo"
            className="w-48 h-48 rounded-full object-cover border-4 border-neutral-100 shadow-md"
          />
          <div className="text-left text-neutral-100">
            <h1 className="text-5xl font-bold mb-4">Hi, I'm Mason</h1>
            <p className="text-lg leading-relaxed text-neutral-300">
              I'm a designer, developer, and nature enthusiast building tools
              that connect people to plants. With a background in UX, spatial
              computing, and frontend systems, I focus on crafting interactive
              experiences that feel natural, intuitive, and beautiful.
            </p>
            <p className="text-lg mt-4 text-neutral-400">
              Outside of work, you’ll find me in the garden, sketching
              interfaces, or hiking trails around the Winston-Salem.
            </p>
          </div>
        </div>
      </div>
    </ParallaxLayer>
  );
};
