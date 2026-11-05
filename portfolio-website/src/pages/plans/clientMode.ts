/*
  The Stripe mode this SPA build was made for, inlined by vite.config.ts from
  the same key the server uses, so the two cannot disagree. Decides only
  whether a Buy action is shown; the server is authoritative and refuses
  anyway. No key at build time (plain local dev) means nothing is buyable.
*/

import { isBuyable, type Plan, type StripeMode } from "../../data/plans";

export const CLIENT_MODE: StripeMode | null = __STRIPE_MODE__;

export const isBuyableHere = (plan: Plan): boolean =>
  CLIENT_MODE !== null && isBuyable(plan, CLIENT_MODE);
