import type { ComponentType } from "react";

export type CalculatorTab =
  | {
      kind: "iframe";
      slug: string;
      label: string;
      src: string;
    }
  | {
      kind: "remote";
      slug: string;
      label: string;
      /** Dynamic import of the federation-exposed module. Each tab is its own chunk. */
      importer: () => Promise<{ default: ComponentType }>;
    };

// Overview embeds the live calculators app via iframe instead of a federated
// mount. Federation-based Overview is blocked by the remote bundling its
// own copy of react-router-dom (host's Router context isn't visible to it).
// Sharing react-router-dom on both sides is the proper future fix.
export const calculatorTabs: CalculatorTab[] = [
  {
    kind: "iframe",
    slug: "overview",
    label: "Overview (iFrame)",
    src: "https://calculators-two-alpha.vercel.app/",
  },
  {
    kind: "remote",
    slug: "surry-county-offer",
    label: "Surry County Offer",
    importer: () => import("calculators/calc/surry-county-offer"),
  },
  {
    kind: "remote",
    slug: "lgs-dscr",
    label: "LGS DSCR",
    importer: () => import("calculators/calc/lgs-dscr"),
  },
  {
    kind: "remote",
    slug: "olamina-dscr",
    label: "Olamina DSCR",
    importer: () => import("calculators/calc/olamina-dscr"),
  },
  {
    kind: "remote",
    slug: "eu5-loan",
    label: "EU5 Loan",
    importer: () => import("calculators/calc/eu5-loan"),
  },
  {
    kind: "remote",
    slug: "winston-salem-lvt",
    label: "Winston-Salem LVT",
    importer: () => import("calculators/calc/winston-salem-lvt"),
  },
  {
    kind: "remote",
    slug: "birchwood-rent-sell",
    label: "Birchwood Rent vs Sell",
    importer: () => import("calculators/calc/birchwood-rent-sell"),
  },
];
