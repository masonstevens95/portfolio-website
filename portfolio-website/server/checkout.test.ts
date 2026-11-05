import { describe, it, expect } from "vitest";
import type { Plan } from "../src/data/plans.js";
import { resolveCheckoutPrice, verifyPrice, buildSessionParams } from "./checkout.js";

const plan = (overrides: Partial<Plan> = {}): Plan => ({
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
      currentPriceId: "price_test_shed",
      acceptedPriceIds: ["price_test_shed"],
      files: [{ label: "x", pathname: "test/shed.pdf" }],
    },
    live: { acceptedPriceIds: [], files: [] },
  },
  ...overrides,
});

const catalog = [plan()];

describe("resolveCheckoutPrice", () => {
  it("resolves a buyable slug to the active mode's current price", () => {
    const result = resolveCheckoutPrice("shed", "test", catalog);
    expect(result).toEqual({ ok: true, plan: catalog[0], priceId: "price_test_shed" });
  });

  it("refuses an unknown slug", () => {
    expect(resolveCheckoutPrice("nope", "test", catalog)).toEqual({ ok: false, reason: "unknown_plan" });
  });

  it("matches slugs exactly, with no normalisation", () => {
    expect(resolveCheckoutPrice(" shed", "test", catalog)).toMatchObject({ ok: false, reason: "unknown_plan" });
    expect(resolveCheckoutPrice("SHED", "test", catalog)).toMatchObject({ ok: false, reason: "unknown_plan" });
  });

  it("refuses a plan with no price in the active mode", () => {
    const comingSoon = plan({
      modes: { test: { acceptedPriceIds: [], files: [] }, live: { acceptedPriceIds: [], files: [] } },
    });
    expect(resolveCheckoutPrice("shed", "test", [comingSoon])).toEqual({ ok: false, reason: "not_for_sale" });
  });

  it("names a mode mismatch when the plan is buyable only in the other mode", () => {
    expect(resolveCheckoutPrice("shed", "live", catalog)).toEqual({ ok: false, reason: "mode_mismatch" });
  });
});

describe("verifyPrice", () => {
  const good = { active: true, unit_amount: 2900, currency: "usd", tax_behavior: "exclusive" };

  it("accepts a price matching amount, currency and exclusive tax", () => {
    expect(verifyPrice(catalog[0], good)).toBeNull();
  });

  it("refuses an amount mismatch", () => {
    expect(verifyPrice(catalog[0], { ...good, unit_amount: 3900 })).toBe("price_mismatch");
  });

  it("refuses a currency mismatch, case-insensitively matching otherwise", () => {
    expect(verifyPrice(catalog[0], { ...good, currency: "cad" })).toBe("price_mismatch");
    expect(verifyPrice(catalog[0], { ...good, currency: "USD" })).toBeNull();
  });

  it("refuses unspecified or inclusive tax behavior", () => {
    expect(verifyPrice(catalog[0], { ...good, tax_behavior: "unspecified" })).toBe("price_mismatch");
    expect(verifyPrice(catalog[0], { ...good, tax_behavior: "inclusive" })).toBe("price_mismatch");
    expect(verifyPrice(catalog[0], { ...good, tax_behavior: null })).toBe("price_mismatch");
  });

  it("refuses an archived price", () => {
    expect(verifyPrice(catalog[0], { ...good, active: false })).toBe("price_mismatch");
  });
});

describe("buildSessionParams", () => {
  const params = buildSessionParams(catalog[0], "price_test_shed", "https://masonstevens.dev");

  it("sells exactly one unit of the resolved price as a one-time payment", () => {
    expect(params.mode).toBe("payment");
    expect(params.ui_mode).toBe("hosted_page");
    expect(params.line_items).toEqual([{ price: "price_test_shed", quantity: 1 }]);
  });

  it("builds success and cancel URLs from the site URL", () => {
    expect(params.success_url).toBe(
      "https://masonstevens.dev/plans/thanks?session_id={CHECKOUT_SESSION_ID}"
    );
    expect(params.cancel_url).toBe("https://masonstevens.dev/plans/shed");
  });

  it("keeps the session id placeholder literal, not encoded", () => {
    expect(params.success_url).toContain("{CHECKOUT_SESSION_ID}");
    expect(params.success_url).not.toContain("%7B");
  });

  it("turns on automatic tax and requires a billing address", () => {
    expect(params.automatic_tax).toEqual({ enabled: true });
    expect(params.billing_address_collection).toBe("required");
  });

  it("tags the session and payment with the slug", () => {
    expect(params.metadata).toEqual({ slug: "shed" });
    expect(params.payment_intent_data).toEqual({ metadata: { slug: "shed" } });
  });
});
