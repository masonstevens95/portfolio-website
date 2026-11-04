import { describe, it, expect } from "vitest";
import { redactId } from "./http.js";

describe("redactId", () => {
  it("keeps the mode prefix and last 6 characters only", () => {
    expect(redactId("cs_live_a1B2c3D4e5F6g7H8")).toBe("cs_live_…F6g7H8");
    expect(redactId("cs_test_a1B2c3D4e5F6g7H8")).toBe("cs_test_…F6g7H8");
  });

  it("never returns the full id", () => {
    const id = "cs_live_supersecretsessiontoken123";
    expect(redactId(id)).not.toContain("supersecret");
  });

  it("handles missing ids and unexpected shapes", () => {
    expect(redactId(null)).toBeNull();
    expect(redactId(undefined)).toBeNull();
    expect(redactId("weird_id_123456")).toBe("…123456");
  });
});
