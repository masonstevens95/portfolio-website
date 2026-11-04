/*
  Server configuration.

  Read lazily (at first use, not import) so a missing variable fails the one
  request that needs it with a named error, rather than crashing every
  function at cold start.

  Mode comes from the key's prefix, so the key and the mode can never
  disagree. SITE_URL is never taken from request headers: success/cancel URLs
  and email links are built from configuration only.

  Relative imports carry .js extensions: package.json is "type": "module" and
  Vercel transpiles these files rather than bundling them, so Node resolves
  them as native ESM at runtime.
*/

import type { StripeMode } from "../src/data/plans.js";
import { modeFromKey } from "../src/data/stripeMode.js";

type Env = Record<string, string | undefined>;

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  mode: StripeMode;
  siteUrl: string;
}

const requireVars = (env: Env, names: string[]): void => {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) {
    throw new ConfigError(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
};

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

/**
 * Production: the explicit SITE_URL (required).
 * Preview: the stable branch URL, so a test purchase redirects back to the
 *   same deployment that created it, not to production.
 * Local: SITE_URL if set, otherwise `vercel dev`'s default port.
 */
export const resolveSiteUrl = (env: Env): string => {
  if (env.VERCEL_ENV === "production") {
    requireVars(env, ["SITE_URL"]);
    return stripTrailingSlash(env.SITE_URL!);
  }

  if (env.VERCEL_ENV === "preview") {
    const host = env.VERCEL_BRANCH_URL ?? env.VERCEL_URL;
    if (!host) throw new ConfigError("Preview deployment has no VERCEL_BRANCH_URL or VERCEL_URL");
    return `https://${host}`;
  }

  return stripTrailingSlash(env.SITE_URL ?? "http://localhost:3000");
};

export const loadStripeConfig = (env: Env = process.env): StripeConfig => {
  requireVars(env, ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);

  const secretKey = env.STRIPE_SECRET_KEY!;
  const mode = modeFromKey(secretKey);
  if (!mode) {
    throw new ConfigError(
      "STRIPE_SECRET_KEY has an unrecognised prefix (expected sk_ or rk_ followed by test_ or live_)"
    );
  }

  return {
    secretKey,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET!,
    mode,
    siteUrl: resolveSiteUrl(env),
  };
};

export interface EmailConfig {
  apiKey: string;
  from: string;
}

/** Validated only where email is used (the webhook), so checkout and
 *  downloads keep working on a deployment without email configured. */
export const loadEmailConfig = (env: Env = process.env): EmailConfig => {
  requireVars(env, ["RESEND_API_KEY", "EMAIL_FROM"]);
  return { apiKey: env.RESEND_API_KEY!, from: env.EMAIL_FROM! };
};
