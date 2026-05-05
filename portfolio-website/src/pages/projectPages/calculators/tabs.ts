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
// mount. Federation-based Overview is now technically possible (the remote
// shares react-router-dom as of the latest deploy), but the iframe path is
// kept for now because it sandboxes routing/state from the host cleanly.
export const calculatorTabs: CalculatorTab[] = [
  {
    kind: "iframe",
    slug: "overview",
    label: "Overview (iFrame)",
    src: "https://calculators-two-alpha.vercel.app/",
  },
  {
    kind: "remote",
    slug: "rural-land-offer",
    label: "Rural Land Offer",
    importer: () => import("calculators/calc/rural-land-offer"),
  },
  {
    kind: "remote",
    slug: "modular-home-dscr",
    label: "Modular Home DSCR",
    importer: () => import("calculators/calc/modular-home-dscr"),
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
    slug: "rent-sell",
    label: "Rent vs Sell",
    importer: () => import("calculators/calc/rent-sell"),
  },
];
