/*
FeaturedWorkBlock
*/

import { ParallaxLayer } from "@react-spring/parallax";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

export const FeaturedWorkBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer
      aria-description="some background info about Yarden"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-3/4 h-full float-right flex flex-col items-center justify-around">
        <div>
          <h1 className="w-full text-neutral-100 text-6xl font-bold text-right space-x-14 space-y-4 p-4">
            {" "}
            Description of What we do
          </h1>
          <h2 className="w-full text-neutral-200 text-4xl font-bold text-right space-x-14 space-y-4 p-4">
            {" "}
            Keep Scrolling to see the design tool in action{" "}
          </h2>
        </div>
      </div>
    </ParallaxLayer>
  );
};
