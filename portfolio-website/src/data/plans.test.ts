import { describe, it, expect } from "vitest";
import {
  plans,
  listedPlans,
  findPlanBySlug,
  findPlanByPriceId,
  isBuyable,
  formatPrice,
  RESERVED_SLUGS,
  type Plan,
  type StripeMode,
} from "./plans";

const MODES: StripeMode[] = ["test", "live"];

const fixture = (overrides: Partial<Plan> = {}): Plan => ({
  slug: "shed",
  title: "Shed",
  listed: true,
  summary: "",
  description: "",
  format: "PDF",
  plates: [],
  included: [],
  cutList: [],
  price: { amount: 2900, currency: "usd" },
  modes: {
    test: {
      currentPriceId: "price_test_new",
      acceptedPriceIds: ["price_test_new", "price_test_old"],
      files: [{ label: "Placeholder", pathname: "test/shed/placeholder.pdf" }],
    },
    live: {
      currentPriceId: "price_live_new",
      acceptedPriceIds: ["price_live_new"],
      files: [{ label: "Plan set", pathname: "live/shed/plans.pdf" }],
    },
  },
  ...overrides,
});

describe("catalog lookups", () => {
  const catalog = [
    fixture(),
    fixture({ slug: "coop", listed: false, modes: {
      test: { acceptedPriceIds: [], files: [] },
      live: { currentPriceId: "price_live_coop", acceptedPriceIds: ["price_live_coop"], files: [{ label: "x", pathname: "live/coop.pdf" }] },
    } }),
  ];

  it("finds a plan by slug", () => {
    expect(findPlanBySlug("shed", catalog)?.title).toBe("Shed");
  });

  it("finds a plan by its current price id in the matching mode", () => {
    expect(findPlanByPriceId("price_test_new", "test", catalog)?.slug).toBe("shed");
  });

  it("still resolves a historical price id after repricing", () => {
    expect(findPlanByPriceId("price_test_old", "test", catalog)?.slug).toBe("shed");
  });

  it("returns nothing for unknown slug or price id", () => {
    expect(findPlanBySlug("nope", catalog)).toBeUndefined();
    expect(findPlanByPriceId("price_nope", "test", catalog)).toBeUndefined();
  });

  it("does not resolve a test price id in live mode", () => {
    expect(findPlanByPriceId("price_test_new", "live", catalog)).toBeUndefined();
  });

  it("matches slugs exactly", () => {
    expect(findPlanBySlug("Shed", catalog)).toBeUndefined();
    expect(findPlanBySlug(" shed", catalog)).toBeUndefined();
  });

  it("buyability is per mode", () => {
    const coop = findPlanBySlug("coop", catalog)!;
    expect(isBuyable(coop, "live")).toBe(true);
    expect(isBuyable(coop, "test")).toBe(false);
  });

  it("hides unlisted plans from the index but still resolves their prices", () => {
    expect(listedPlans(catalog).map((p) => p.slug)).toEqual(["shed"]);
    expect(findPlanByPriceId("price_live_coop", "live", catalog)?.slug).toBe("coop");
  });

  it("formats the display price", () => {
    expect(formatPrice({ amount: 2900, currency: "usd" })).toBe("$29.00");
  });
});

describe("catalog invariants", () => {
  it("has at least one plan", () => {
    expect(plans.length).toBeGreaterThan(0);
  });

  it("has unique, URL-safe, non-reserved slugs", () => {
    const slugs = plans.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(RESERVED_SLUGS as readonly string[]).not.toContain(slug);
    }
  });

  it("maps every price id to at most one plan across both modes", () => {
    const seen = new Map<string, string>();
    for (const plan of plans) {
      for (const mode of MODES) {
        for (const id of plan.modes[mode].acceptedPriceIds) {
          expect(seen.get(id), `${id} is claimed twice`).toBeUndefined();
          seen.set(id, plan.slug);
        }
      }
    }
  });

  it("keeps each mode's current price inside its accepted list", () => {
    for (const plan of plans) {
      for (const mode of MODES) {
        const { currentPriceId, acceptedPriceIds } = plan.modes[mode];
        if (currentPriceId) expect(acceptedPriceIds).toContain(currentPriceId);
      }
    }
  });

  it("gives every sellable mode files and a positive price", () => {
    for (const plan of plans) {
      for (const mode of MODES) {
        if (plan.modes[mode].currentPriceId) {
          expect(plan.modes[mode].files.length).toBeGreaterThan(0);
          expect(plan.price.amount).toBeGreaterThan(0);
        }
      }
    }
  });

  it("never lets test-mode files point at live files", () => {
    for (const plan of plans) {
      const live = new Set(plan.modes.live.files.map((f) => f.pathname));
      for (const f of plan.modes.test.files) expect(live.has(f.pathname)).toBe(false);
    }
  });
});
