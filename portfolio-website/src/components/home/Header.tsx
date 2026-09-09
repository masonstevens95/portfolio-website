/*
  Header

  Sticky nav on the stock ground with a heavy ink rule beneath it. Uppercase
  tracked spruce labels.

  There is deliberately no active-item state: the audio toggle, the animated
  hint arrow, its localStorage key and the Redux scroll-spy all went with the
  ambient scene. Nav is plain anchor navigation to the ids owned by
  SectionHead, so nothing needs to track which section is in view.
*/

import { Rule } from "../broadside";

const NAV = [
  { id: "WELCOME", label: "Welcome" },
  { id: "ABOUT_ME", label: "About" },
  { id: "FEATURED_WORK", label: "Work" },
  { id: "CONTACT", label: "Contact" },
];

export const Header = () => (
  <div
    className="sticky top-0 z-50"
    style={{ background: "var(--stock)" }}
  >
    <nav
      className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 sm:px-8 py-3"
      style={{ maxWidth: "var(--maxw)" }}
    >
      {NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="label no-underline hover:opacity-70 transition-opacity"
          style={{ color: "var(--spruce)" }}
        >
          {item.label}
        </a>
      ))}
    </nav>
    <Rule weight="heavy" />
  </div>
);
