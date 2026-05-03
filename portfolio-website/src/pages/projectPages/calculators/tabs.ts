import type { ComponentType } from "react";

export interface CalculatorTab {
  /** URL slug appended to /projects/calculators. Empty string = index (Overview). */
  slug: string;
  label: string;
  /** Dynamic import of the federation-exposed module. Each tab is its own chunk. */
  importer: () => Promise<{ default: ComponentType }>;
}

export const calculatorTabs: CalculatorTab[] = [
  {
    slug: "",
    label: "Overview",
    importer: () => import("calculators/CalculatorsRoutes"),
  },
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
