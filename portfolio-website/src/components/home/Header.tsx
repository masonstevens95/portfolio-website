/*
  Header

  Sticky nav on the stock ground with a heavy ink rule beneath it. Uppercase
  tracked spruce labels.

  There is deliberately no active-item state: the audio toggle, the animated
  hint arrow, its localStorage key and the Redux scroll-spy all went with the
  ambient scene. Nav is plain anchor navigation to the ids owned by
  SectionHead, so nothing needs to track which section is in view.

  Plans is the one route link: it leaves the home page rather than scrolling
  within it, so it is a router Link, not an anchor.
*/

import { Link } from "react-router-dom";
import { Rule } from "../broadside";

type NavItem =
  | { kind: "anchor"; id: string; label: string }
  | { kind: "route"; to: string; label: string };

const NAV: NavItem[] = [
  { kind: "anchor", id: "WELCOME", label: "Welcome" },
  { kind: "anchor", id: "ABOUT_ME", label: "About" },
  { kind: "anchor", id: "FEATURED_WORK", label: "Work" },
  { kind: "route", to: "/plans", label: "Plans" },
  { kind: "anchor", id: "CONTACT", label: "Contact" },
];

const ITEM_CLASS =
  "label no-underline hover:opacity-70 transition-opacity py-2 inline-block";

export const Header = () => (
  <div
    className="sticky top-0 z-50"
    style={{ background: "var(--stock)" }}
  >
    <nav
      className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 sm:px-8 py-1"
      style={{ maxWidth: "var(--maxw)" }}
    >
      {NAV.map((item) =>
        item.kind === "route" ? (
          <Link key={item.to} to={item.to} className={ITEM_CLASS}>
            {item.label}
          </Link>
        ) : (
          <a key={item.id} href={`#${item.id}`} className={ITEM_CLASS}>
            {item.label}
          </a>
        )
      )}
    </nav>
    <Rule weight="heavy" />
  </div>
);
