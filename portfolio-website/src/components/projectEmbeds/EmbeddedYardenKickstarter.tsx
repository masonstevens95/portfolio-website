/*
  EmbeddedYardenKickstarter.tsx

  Previously a green gradient card with a hover scale and two shadows —
  three prohibitions at once. Now an ink-bordered notice with a spruce label.
  Copy and destination are unchanged.
*/

import { IoIosLink } from "react-icons/io";

export const EmbeddedYardenKickstarter = () => {
  return (
    <section className="w-full my-12">
      <a
        href="https://www.kickstarter.com/projects/masonstevens95/yarden-revolutionizing-landscape-design"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6 no-underline"
        style={{ border: "4px solid var(--ink)", color: "var(--ink)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label m-0 mb-2">Campaign</p>
            <h3 className="display m-0 mb-2" style={{ fontSize: "26px" }}>
              Yarden Kickstarter
            </h3>
            <p
              className="m-0 max-w-xl"
              style={{ fontSize: "15px", lineHeight: 1.55 }}
            >
              Explore the original Kickstarter campaign I created to launch
              Yarden. Although it wasn't funded, the experience was a huge
              learning opportunity in pitching and product positioning.
            </p>
          </div>
          <IoIosLink
            className="w-6 h-6 shrink-0"
            style={{ color: "var(--spruce)" }}
            aria-hidden="true"
          />
        </div>
      </a>
    </section>
  );
};
