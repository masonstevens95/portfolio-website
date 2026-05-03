import type { ComponentType } from "react";

export interface CalculatorTab {
  /** URL slug appended to /projects/calculators. */
  slug: string;
  label: string;
  /** Dynamic import of the federation-exposed module. Each tab is its own chunk. */
  importer: () => Promise<{ default: ComponentType }>;
}

// Overview tab intentionally omitted. The remote's CalculatorsRoutes
// calls useRoutes() against its own bundled copy of react-router-dom
// (not shared with the host), so the host's Router context is invisible
// to it and the call throws. CalculatorsApp would mount its own
// BrowserRouter from the same bundled copy, which would fight the host
// for window.history. Sharing react-router-dom on both sides would
// resolve both — that change belongs in the calculators repo's
// federation config.
export const calculatorTabs: CalculatorTab[] = [
  {
    slug: "surry-county-offer",
    label: "Surry County Offer",
    importer: () => import("calculators/calc/surry-county-offer"),
  },
  {
    slug: "lgs-dscr",
    label: "LGS DSCR",
    importer: () => import("calculators/calc/lgs-dscr"),
  },
  {
    slug: "olamina-dscr",
    label: "Olamina DSCR",
    importer: () => import("calculators/calc/olamina-dscr"),
  },
  {
    slug: "eu5-loan",
    label: "EU5 Loan",
    importer: () => import("calculators/calc/eu5-loan"),
  },
  {
    slug: "winston-salem-lvt",
    label: "Winston-Salem LVT",
    importer: () => import("calculators/calc/winston-salem-lvt"),
  },
  {
    slug: "birchwood-rent-sell",
    label: "Birchwood Rent vs Sell",
    importer: () => import("calculators/calc/birchwood-rent-sell"),
  },
];
