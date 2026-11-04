/*
  POST /api/checkout  { slug }  →  { url }

  Turns a plan slug into a Stripe hosted Checkout URL. The client never sends
  a price; see server/checkout.ts for the integrity checks.

  Every refusal returns the same generic client error. The specific reason
  goes to the logs, where "price_mismatch" and "mode_mismatch" are the ones
  that mean configuration needs fixing.
*/

import { loadStripeConfig } from "../server/config.js";
import { getStripe } from "../server/stripe.js";
import { buildSessionParams, resolveCheckoutPrice, verifyPrice } from "../server/checkout.js";
import { errorMessage, json, log } from "../server/http.js";

const REFUSED = { error: "This plan can't be bought right now." };

const readSlug = async (request: Request): Promise<string | null> => {
  try {
    const body = (await request.json()) as { slug?: unknown };
    return typeof body.slug === "string" && body.slug.length <= 100 ? body.slug : null;
  } catch {
    return null;
  }
};

export async function POST(request: Request): Promise<Response> {
  const slug = await readSlug(request);
  if (!slug) return json(400, { error: "Bad request." });

  try {
    const config = loadStripeConfig();
    const resolution = resolveCheckoutPrice(slug, config.mode);
    if (!resolution.ok) {
      log("checkout.refused", { slug, reason: resolution.reason, mode: config.mode });
      return json(409, REFUSED);
    }

    const { plan, priceId } = resolution;
    const stripe = getStripe(config.secretKey);

    const price = await stripe.prices.retrieve(priceId);
    const mismatch = verifyPrice(plan, price);
    if (mismatch) {
      log("checkout.refused", {
        slug,
        reason: mismatch,
        priceId,
        stripe: { amount: price.unit_amount, currency: price.currency, tax: price.tax_behavior, active: price.active },
        catalog: plan.price,
      });
      return json(409, REFUSED);
    }

    const session = await stripe.checkout.sessions.create(
      buildSessionParams(plan, priceId, config.siteUrl)
    );
    if (!session.url) throw new Error("Stripe returned a session without a url");

    log("checkout.created", { slug, sessionId: session.id });
    return json(200, { url: session.url });
  } catch (error) {
    log("checkout.error", { slug, message: errorMessage(error) });
    return json(500, { error: "Checkout is unavailable. Please try again." });
  }
}
