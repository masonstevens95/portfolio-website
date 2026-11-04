import { describe, it, expect } from "vitest";
import { modeFromKey, parseMode, checkModeAgreement } from "./stripeMode";

describe("modeFromKey", () => {
  it("reads secret and restricted keys in both modes", () => {
    expect(modeFromKey("sk_test_abc")).toBe("test");
    expect(modeFromKey("sk_live_abc")).toBe("live");
    expect(modeFromKey("rk_test_abc")).toBe("test");
    expect(modeFromKey("rk_live_abc")).toBe("live");
  });

  it("rejects publishable keys, junk and missing values", () => {
    expect(modeFromKey("pk_live_abc")).toBeNull();
    expect(modeFromKey("sk_prod_abc")).toBeNull();
    expect(modeFromKey("")).toBeNull();
    expect(modeFromKey(undefined)).toBeNull();
  });
});

describe("parseMode", () => {
  it("accepts only test and live", () => {
    expect(parseMode("test")).toBe("test");
    expect(parseMode("live")).toBe("live");
    expect(parseMode("LIVE")).toBeNull();
    expect(parseMode(undefined)).toBeNull();
  });
});

describe("checkModeAgreement", () => {
  it("passes when no key is configured (SPA-only dev)", () => {
    expect(checkModeAgreement(undefined, undefined)).toBeNull();
  });

  it("passes when the declared mode matches the key", () => {
    expect(checkModeAgreement("test", "sk_test_x")).toBeNull();
    expect(checkModeAgreement("live", "rk_live_x")).toBeNull();
  });

  it("fails a live flag paired with a test key, and the reverse", () => {
    expect(checkModeAgreement("live", "sk_test_x")).toMatch(/test-mode key/);
    expect(checkModeAgreement("test", "sk_live_x")).toMatch(/live-mode key/);
  });

  it("fails when a key is present but the flag is missing", () => {
    expect(checkModeAgreement(undefined, "sk_live_x")).toMatch(/must be "test" or "live"/);
  });

  it("fails on an unrecognised key prefix", () => {
    expect(checkModeAgreement("live", "pk_live_x")).toMatch(/unrecognised prefix/);
  });
});
