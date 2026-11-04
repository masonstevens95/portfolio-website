/*
  The Stripe mode this SPA build was made for. Decides only whether a Buy
  action is shown; the server is authoritative and refuses anyway.

  vite.config.ts fails the build when this disagrees with the Stripe key, so
  in a deployed build it cannot silently drift. Unset (plain local dev) means
  nothing is buyable.
*/

import { parseMode } from "../../data/stripeMode";

export const CLIENT_MODE = parseMode(import.meta.env.VITE_STRIPE_MODE);
