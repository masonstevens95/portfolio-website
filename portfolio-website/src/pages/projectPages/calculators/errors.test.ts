import { describe, it, expect } from "vitest";
import { isRemoteLoadFailure } from "./errors";

describe("isRemoteLoadFailure", () => {
  it("returns false for undefined", () => {
    expect(isRemoteLoadFailure(undefined)).toBe(false);
  });

  it("returns false for an Error with no message", () => {
    expect(isRemoteLoadFailure(new Error())).toBe(false);
  });

  it("returns false for an ordinary runtime error", () => {
    expect(
      isRemoteLoadFailure(new Error("Cannot read property 'x' of undefined"))
    ).toBe(false);
  });

  it("recognizes ChunkLoadError by name regardless of message", () => {
    const e = new Error("anything");
    e.name = "ChunkLoadError";
    expect(isRemoteLoadFailure(e)).toBe(true);
  });

  it("recognizes Vite's 'Failed to fetch dynamically imported module'", () => {
    expect(
      isRemoteLoadFailure(
        new Error(
          "Failed to fetch dynamically imported module: https://example.com/foo.js"
        )
      )
    ).toBe(true);
  });

  it("recognizes 'error loading dynamically imported module'", () => {
    expect(
      isRemoteLoadFailure(
        new Error("error loading dynamically imported module")
      )
    ).toBe(true);
  });

  it("recognizes 'Loading chunk N failed'", () => {
    expect(isRemoteLoadFailure(new Error("Loading chunk 5 failed"))).toBe(true);
  });

  it("recognizes 'Loading CSS chunk failed'", () => {
    expect(isRemoteLoadFailure(new Error("Loading CSS chunk 3 failed"))).toBe(
      true
    );
  });

  it("recognizes 'Importing a module script failed'", () => {
    expect(
      isRemoteLoadFailure(new Error("Importing a module script failed"))
    ).toBe(true);
  });

  it("recognizes the MF 'does not exist in container' error", () => {
    expect(
      isRemoteLoadFailure(
        new Error(
          "[Module Federation] Module ./calc/birchwood-rent-sell does not exist in container."
        )
      )
    ).toBe(true);
  });

  it("recognizes any [Module Federation]-prefixed error", () => {
    expect(
      isRemoteLoadFailure(
        new Error("[Module Federation] Failed to load remote calculators")
      )
    ).toBe(true);
  });

  it("does NOT match a runtime error that merely mentions 'module'", () => {
    expect(
      isRemoteLoadFailure(new Error("Cannot find module './local'"))
    ).toBe(false);
  });
});
