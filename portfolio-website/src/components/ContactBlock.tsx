/*
  ContactBlock
*/

import { ParallaxLayer } from "@react-spring/parallax";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

export const ContactBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer offset={offset} speed={speed} factor={factor}>
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-neutral-100">
        <h1 className="text-5xl font-bold mb-4 text-center">Let's Connect</h1>
        <p className="text-lg mb-8 text-center text-neutral-300 max-w-2xl">
          Whether you're interested in collaborating, have a question, or just
          want to say hello — I’d love to hear from you!
        </p>
        <div className="flex flex-col gap-4 text-center">
          <a
            href="mailto:youremail@example.com"
            className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 transition"
          >
            Send an Email
          </a>
          <div className="text-sm text-neutral-400">
            or reach me via LinkedIn, GitHub, or other platforms below.
          </div>
        </div>
      </div>
    </ParallaxLayer>
  );
};
