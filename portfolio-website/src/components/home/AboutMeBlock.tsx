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
        <div className="bg-[var(--orchard-bark)]/45 rounded-3xl shadow-lg backdrop-blur-lg border border-[var(--orchard-honey)]/15 p-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8">
          <img
            src="/assets/profile.jpg"
            alt="Profile photo"
            className="w-48 h-48 rounded-full object-cover border-4 border-[var(--orchard-cream)]/30 shadow-md"
          />
          <div className="text-left text-[var(--orchard-cream)]">
            <h1 className="text-5xl font-bold mb-4">Hi, I’m Mason</h1>
            <p className="text-lg leading-relaxed text-[var(--orchard-cream)]/85">
              I’m a designer, developer, and nature enthusiast building tools
              that connect people to plants. With a background in UX, spatial
              computing, and frontend systems, I focus on crafting interactive
              experiences that feel natural, intuitive, and beautiful.
            </p>
            <p className="text-lg mt-4 text-[var(--orchard-cream)]/65">
              Outside of work, you’ll find me in my orchard, sketching
              interfaces, or mountain biking trails around Winston-Salem.
            </p>
          </div>
        </div>
      </div>
    </ParallaxLayer>
  );
};
