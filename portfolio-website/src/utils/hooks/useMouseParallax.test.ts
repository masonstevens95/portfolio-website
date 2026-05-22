import { describe, it, expect } from "vitest";
import { normalizeMousePosition } from "./useMouseParallax";

describe("normalizeMousePosition", () => {
  it("returns {0, 0} at viewport center", () => {
    expect(normalizeMousePosition(500, 400, 1000, 800)).toEqual({ x: 0, y: 0 });
  });

  it("returns {-0.5, -0.5} at top-left corner", () => {
    expect(normalizeMousePosition(0, 0, 1000, 800)).toEqual({ x: -0.5, y: -0.5 });
  });

  it("returns {0.5, 0.5} at bottom-right corner", () => {
    expect(normalizeMousePosition(1000, 800, 1000, 800)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("normalizes proportionally for off-center positions", () => {
    const r = normalizeMousePosition(750, 200, 1000, 800);
    expect(r.x).toBeCloseTo(0.25);
    expect(r.y).toBeCloseTo(-0.25);
  });
});
