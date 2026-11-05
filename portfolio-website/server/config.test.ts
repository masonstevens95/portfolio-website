import { describe, it, expect } from "vitest";
import { loadStripeConfig, loadEmailConfig, resolveSiteUrl, ConfigError } from "./config.js";

const base = {
  STRIPE_SECRET_KEY: "rk_test_abc",
  STRIPE_WEBHOOK_SECRET: "whsec_abc",
  VERCEL_ENV: "preview",
  VERCEL_BRANCH_URL: "portfolio-git-feat-plans.vercel.app",
};

describe("loadStripeConfig", () => {
  it("derives the mode from the key prefix", () => {
    expect(loadStripeConfig(base).mode).toBe("test");
    expect(
      loadStripeConfig({ ...base, STRIPE_SECRET_KEY: "sk_live_x", VERCEL_ENV: "production", SITE_URL: "https://masonstevens.dev" }).mode
    ).toBe("live");
  });

  it("names every missing variable", () => {
    expect(() => loadStripeConfig({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "x.vercel.app" })).toThrow(
      /STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET/
    );
    expect(() => loadStripeConfig({})).toThrow(ConfigError);
  });

  it("rejects a key with an unknown prefix", () => {
    expect(() => loadStripeConfig({ ...base, STRIPE_SECRET_KEY: "pk_test_abc" })).toThrow(/prefix/);
  });
});

describe("resolveSiteUrl", () => {
  it("uses the explicit SITE_URL in production and requires it", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "production", SITE_URL: "https://masonstevens.dev/" })).toBe(
      "https://masonstevens.dev"
    );
    expect(() => resolveSiteUrl({ VERCEL_ENV: "production" })).toThrow(/SITE_URL/);
  });

  it("uses the branch URL on previews so redirects land on the same deployment", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "portfolio-git-x.vercel.app" })).toBe(
      "https://portfolio-git-x.vercel.app"
    );
  });

  it("falls back to the deployment URL on a preview with no branch URL", () => {
    expect(resolveSiteUrl({ VERCEL_ENV: "preview", VERCEL_URL: "portfolio-abc.vercel.app" })).toBe(
      "https://portfolio-abc.vercel.app"
    );
  });

  it("uses SITE_URL or localhost in local development", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
    expect(resolveSiteUrl({ SITE_URL: "http://localhost:5173" })).toBe("http://localhost:5173");
  });
});

describe("loadEmailConfig", () => {
  it("names missing email variables without touching Stripe config", () => {
    expect(() => loadEmailConfig({})).toThrow(/RESEND_API_KEY.*EMAIL_FROM/);
    expect(loadEmailConfig({ RESEND_API_KEY: "re_x", EMAIL_FROM: "Plans <plans@masonstevens.dev>" })).toEqual({
      apiKey: "re_x",
      from: "Plans <plans@masonstevens.dev>",
    });
  });
});
