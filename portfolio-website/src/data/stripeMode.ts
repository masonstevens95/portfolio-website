/*
  stripeMode.ts

  Which Stripe mode (test / live) is active, and the guard that keeps the
  SPA's build-time idea of it honest.

  The server derives its mode from the secret key's prefix, so key and mode
  can never disagree. The SPA cannot see the key, so it is told the mode at
  build time via VITE_STRIPE_MODE. checkModeAgreement() runs during
  `vite build` and fails the deploy when the two disagree, instead of
  silently hiding sales (live key, test flag) or showing Buy buttons the
  server will always refuse (test key, live flag).

  Framework-free: imported by vite.config.ts, the SPA and server/.
*/

import type { StripeMode } from "./plans.js";

/** sk_/rk_ (secret or restricted) followed by test_/live_. */
export const modeFromKey = (key: string | undefined): StripeMode | null => {
  const match = /^(?:sk|rk)_(test|live)_/.exec(key ?? "");
  return match ? (match[1] as StripeMode) : null;
};

export const parseMode = (value: string | undefined): StripeMode | null =>
  value === "test" || value === "live" ? value : null;

/**
 * Returns an error message when the build-time mode and the key disagree,
 * or null when they agree. With no key present (SPA-only local dev) there
 * is nothing to compare, so it passes.
 */
export const checkModeAgreement = (
  viteMode: string | undefined,
  key: string | undefined
): string | null => {
  if (!key) return null;

  const keyMode = modeFromKey(key);
  if (!keyMode) {
    return "STRIPE_SECRET_KEY has an unrecognised prefix (expected sk_ or rk_ followed by test_ or live_).";
  }

  const declared = parseMode(viteMode);
  if (!declared) {
    return `VITE_STRIPE_MODE must be "test" or "live" when a Stripe key is configured (the key is ${keyMode}-mode).`;
  }

  if (declared !== keyMode) {
    return `VITE_STRIPE_MODE is "${declared}" but STRIPE_SECRET_KEY is a ${keyMode}-mode key. Set them as a pair per Vercel environment.`;
  }

  return null;
};
