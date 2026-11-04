/*
  Checkout: the price-integrity boundary.

  The client sends only a slug. Everything that decides what is charged comes
  from the catalog and is checked against Stripe before a session exists:

    slug ──catalog──▶ current Price ID for this mode
         ──Stripe───▶ Price { amount, currency, tax_behavior, active }
         ──verify───▶ must equal the catalog's display price, exclusive tax

  Any mismatch refuses (fails closed). Drift between the catalog and Stripe
  becomes a visible failed checkout, never a silent wrong charge.

  Pure functions only; api/checkout.ts does the I/O.
*/

import { findPlanBySlug, isBuyable, type Plan, type StripeMode } from "../src/data/plans.js";

export type CheckoutRefusal = "unknown_plan" | "not_for_sale" | "mode_mismatch" | "price_mismatch";

export type PriceResolution =
  | { ok: true; plan: Plan; priceId: string }
  | { ok: false; reason: CheckoutRefusal };

/** The fields of a Stripe Price this check depends on. */
export interface PriceFacts {
  active: boolean;
  unit_amount: number | null;
  currency: string;
  tax_behavior?: string | null;
}

export const resolveCheckoutPrice = (
  slug: string,
  mode: StripeMode,
  catalog?: Plan[]
): PriceResolution => {
  const plan = findPlanBySlug(slug, catalog);
  if (!plan) return { ok: false, reason: "unknown_plan" };

  const priceId = plan.modes[mode].currentPriceId;
  if (priceId) return { ok: true, plan, priceId };

  const otherMode: StripeMode = mode === "test" ? "live" : "test";
  return { ok: false, reason: isBuyable(plan, otherMode) ? "mode_mismatch" : "not_for_sale" };
};

/** Returns a refusal reason, or null when Stripe's Price matches the catalog. */
export const verifyPrice = (plan: Plan, price: PriceFacts): CheckoutRefusal | null => {
  const matches =
    price.active &&
    price.unit_amount === plan.price.amount &&
    price.currency.toLowerCase() === plan.price.currency.toLowerCase() &&
    price.tax_behavior === "exclusive";

  return matches ? null : "price_mismatch";
};

export const buildSessionParams = (plan: Plan, priceId: string, siteUrl: string) => ({
  mode: "payment" as const,
  ui_mode: "hosted_page" as const,
  line_items: [{ price: priceId, quantity: 1 }],
  // Built by concatenation so the {CHECKOUT_SESSION_ID} placeholder stays
  // literal — URL builders would percent-encode the braces and Stripe would
  // not substitute it.
  success_url: `${siteUrl}/plans/thanks?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${siteUrl}/plans/${plan.slug}`,
  automatic_tax: { enabled: true },
  billing_address_collection: "required" as const,
  metadata: { slug: plan.slug },
  payment_intent_data: { metadata: { slug: plan.slug } },
});
