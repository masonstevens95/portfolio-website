/*
  WelcomeBlock - Styled like AboutMeBlock, aligned right
*/

import { ParallaxLayer } from "@react-spring/parallax";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

export const WelcomeBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer
      aria-description="Welcome Block"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-end p-8">
        <div className="bg-[var(--orchard-bark)]/45 rounded-3xl shadow-lg backdrop-blur-lg border border-[var(--orchard-honey)]/15 p-10 max-w-4xl w-full flex flex-col items-end text-right gap-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--orchard-cream)]">
            Welcome to My Portfolio
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--orchard-cream)]/80">
            Showcasing UI/UX, Web Projects & Creative Tools
          </h2>
          {/* <p className="text-lg max-w-xl text-neutral-400">
            I’m Mason – a designer and developer focused on building intuitive
            tools for spatial interaction, digital design, and the outdoors.
          </p> */}
        </div>
      </div>
    </ParallaxLayer>
  );
};
