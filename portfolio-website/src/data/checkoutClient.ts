/*
  checkoutClient.ts

  The Buy action's call to /api/checkout. Interpretation is a pure function
  so it can be tested without a DOM.

  The redirect target is checked against Stripe's hosted checkout origin:
  even a misconfigured or compromised server response cannot send a buyer
  somewhere else from this button.
*/

const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com";

export type CheckoutResult = { ok: true; url: string } | { ok: false };

export const interpretCheckoutResponse = (status: number, body: unknown): CheckoutResult => {
  if (status < 200 || status >= 300) return { ok: false };
  if (!body || typeof body !== "object") return { ok: false };

  const url = (body as { url?: unknown }).url;
  if (typeof url !== "string") return { ok: false };

  try {
    return new URL(url).origin === STRIPE_CHECKOUT_ORIGIN ? { ok: true, url } : { ok: false };
  } catch {
    return { ok: false };
  }
};

export const startCheckout = async (slug: string): Promise<CheckoutResult> => {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const body = await response.json().catch(() => null);
    return interpretCheckoutResponse(response.status, body);
  } catch {
    return { ok: false };
  }
};
