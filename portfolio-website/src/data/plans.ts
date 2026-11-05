/*
  plans.ts

  The plans catalog. Single source of truth for everything the storefront
  shows and everything the server needs to sell and deliver a plan.

  This module is imported by BOTH the SPA (src/pages/plans) and the Vercel
  functions (api/, server/). Keep it free of React, the DOM, and
  import.meta.env so it loads cleanly under plain Node.

  Per-mode blocks (test / live):
    - currentPriceId   what checkout charges today. Absent = coming soon.
    - acceptedPriceIds every Price this plan has ever sold under, current
                       included. Stripe Prices are immutable, so repricing
                       mints a new ID; past buyers inside their access window
                       still resolve through the old one.
    - files            what a paid session in this mode unlocks. Test mode
                       points at placeholder files, never the real plan, so a
                       test-card purchase on a preview cannot leak it.

  Retiring a plan: set listed: false. Never delete an entry that has sold —
  its buyers' Price IDs would stop resolving.
*/

export type StripeMode = "test" | "live";

export interface PlanFile {
  /** Shown to the buyer, e.g. "Plan set (PDF)". */
  label: string;
  /** Pathname in the private Blob store. Not secret: access needs a signed URL. */
  pathname: string;
}

export interface PlanModeConfig {
  currentPriceId?: string;
  acceptedPriceIds: string[];
  files: PlanFile[];
}

export interface PlanPlate {
  src?: string;
  alt: string;
  caption: string;
}

export interface CutListRow {
  qty: number;
  length: string;
  part: string;
  note?: string;
}

export interface Plan {
  slug: string;
  title: string;
  /** Hidden from the index when false. The detail page still resolves. */
  listed: boolean;
  summary: string;
  description: string;
  /** e.g. "PDF plan set, 6 sheets + SketchUp model". */
  format: string;
  plates: PlanPlate[];
  included: string[];
  cutList: CutListRow[];
  /** Pre-tax display price, in minor units. Checkout verifies it against Stripe. */
  price: { amount: number; currency: string };
  modes: Record<StripeMode, PlanModeConfig>;
}

/** /plans/thanks is the post-purchase route; no plan may claim it. */
export const RESERVED_SLUGS = ["thanks"] as const;

export const plans: Plan[] = [
  {
    slug: "tool-cage",
    title: "2x4 Tool Cage",
    listed: true,
    summary:
      "A freestanding rack that hangs long-handled tools head-up through a slotted deck. Built entirely from 2x4s.",
    description:
      "Shovels, rakes, forks and hoes stand head-up with the handle hanging through a slot in the deck. Each tool rests on its collar with its centre of mass below the rest point, so it hangs like a pendulum instead of balancing. The 4-foot depth is the swing room that lets a 57-inch tool load into a 6-foot-tall space.",
    format: "PDF plan set + SketchUp model",
    plates: [
      { alt: "Tool cage, front elevation", caption: "Front elevation" },
    ],
    included: [
      "Dimensioned elevations and deck plan",
      "Cut list and shopping list for 2x4 stock",
      "Assembly sequence with build notes",
      "SketchUp model with brand materials",
    ],
    cutList: [
      { qty: 4, length: '72"', part: "Frame long members", note: "On edge, 2 base + 2 top" },
      { qty: 4, length: '45"', part: "Frame short members", note: "On edge, fitted between the longs" },
      { qty: 4, length: '41.5"', part: "Posts", note: '3.5" face along the width' },
      { qty: 11, length: '48"', part: "Deck slats", note: "Laid flat" },
      { qty: 10, length: '48"', part: "Floor slats (optional)", note: "Laid flat, under each slot" },
    ],
    price: { amount: 1200, currency: "usd" },
    modes: {
      test: {
        acceptedPriceIds: [],
        files: [{ label: "Plan set (PDF, test placeholder)", pathname: "test/tool-cage/placeholder.pdf" }],
      },
      live: {
        acceptedPriceIds: [],
        files: [
          { label: "Plan set (PDF)", pathname: "live/tool-cage/tool-cage-plans.pdf" },
          { label: "SketchUp model", pathname: "live/tool-cage/tool-cage.skp" },
        ],
      },
    },
  },
];

export const listedPlans = (catalog: Plan[] = plans): Plan[] =>
  catalog.filter((p) => p.listed);

export const findPlanBySlug = (slug: string, catalog: Plan[] = plans): Plan | undefined =>
  catalog.find((p) => p.slug === slug);

export const findPlanByPriceId = (
  priceId: string,
  mode: StripeMode,
  catalog: Plan[] = plans
): Plan | undefined =>
  catalog.find((p) => p.modes[mode].acceptedPriceIds.includes(priceId));

export const isBuyable = (plan: Plan, mode: StripeMode): boolean =>
  Boolean(plan.modes[mode].currentPriceId);

export const formatPrice = ({ amount, currency }: Plan["price"]): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    amount / 100
  );
