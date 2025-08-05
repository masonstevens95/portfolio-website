/*
  EmbeddedYardenKickstarter.tsx
*/

import { IoIosLink } from "react-icons/io";

export const EmbeddedYardenKickstarter = () => {
  return (
    <section className="w-full my-12 px-4">
      <a
        href="https://www.kickstarter.com/projects/masonstevens95/yarden-revolutionizing-landscape-design"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-green-700 via-lime-600 to-green-900 border border-neutral-800 rounded-xl p-6 shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Yarden Kickstarter
            </h3>
            <p className="text-neutral-100 text-md max-w-xl">
              Explore the original Kickstarter campaign I created to launch
              Yarden. Although it wasn't funded, the experience was a huge
              learning opportunity in pitching and product positioning.
            </p>
          </div>
          <IoIosLink className="text-white w-6 h-6 shrink-0" />
        </div>
      </a>
    </section>
  );
};
