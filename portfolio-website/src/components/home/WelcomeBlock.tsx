/*
WelcomeBlock - Portfolio Version
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
      style={{
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backgroundSize: "cover",
        // justifyItems: 'end',
      }}
    >
      <div className="w-auto pr-16 h-full float-right flex flex-col items-center justify-around">
        <section className="w-full bg-neutral-900 text-neutral-100 py-12 px-6">
          <div className="max-w-5xl mx-auto text-right">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to My Portfolio
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-300 mb-6">
              Showcasing UI/UX, Web Projects & Creative Tools
            </h2>
            <p className="text-lg text-neutral-400 max-w-xl ml-auto">
              I’m Mason – a designer and developer focused on crafting intuitive
              digital experiences. Scroll down to explore selected work.
            </p>
          </div>
        </section>

        {/* <button
          className="bg-slate-100 text-neutral-800 p-1 rounded-md w-1/5 text-center"
          onClick={() => handleRedirectToPlantCatalog()}
        >
          Check out our free plant library!
        </button>

        <button
          className="bg-slate-100 text-neutral-800 p-1 rounded-md w-1/5 text-center"
          onClick={() => parallaxRef.current.scrollTo(1.25)}
        >
          Jump to our design tool showcase...
        </button> */}
      </div>
    </ParallaxLayer>
  );
};
