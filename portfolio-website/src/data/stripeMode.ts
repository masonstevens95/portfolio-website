/*
  stripeMode.ts

  Which Stripe mode (test / live) a secret or restricted key belongs to.

  Both sides derive their mode from the same key: the server at request time
  (server/config.ts), the SPA at build time (vite.config.ts inlines the result
  as __STRIPE_MODE__). There is no second setting to drift out of sync.

  Framework-free: imported by vite.config.ts and server/.
*/

import type { StripeMode } from "./plans.js";

/** sk_/rk_ (secret or restricted) followed by test_/live_. */
export const modeFromKey = (key: string | undefined): StripeMode | null => {
  const match = /^(?:sk|rk)_(test|live)_/.exec(key ?? "");
  return match ? (match[1] as StripeMode) : null;
};
