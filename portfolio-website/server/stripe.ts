/*
  Stripe client, one per warm function instance.

  apiVersion is pinned to the version the installed SDK ships with
  (stripe@23.1.0). Bump both together. Note: API 2026-03-25.dahlia renamed
  Checkout ui_mode values; examples using "embedded"/"hosted" are stale.
*/

import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-10-28.endive" as const;

let client: Stripe | undefined;
let clientKey: string | undefined;

export const getStripe = (secretKey: string): Stripe => {
  if (!client || clientKey !== secretKey) {
    // Bounded so a slow Stripe call fails fast inside the webhook's ~10s
    // budget (Checkout waits on it) and Stripe's own retry takes over.
    client = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION, timeout: 8000, maxNetworkRetries: 1 });
    clientKey = secretKey;
  }
  return client;
};
