import { describe, it, expect } from "vitest";
import { modeFromKey } from "./stripeMode";

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
