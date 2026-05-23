import { describe, it, expect } from "vitest";
import { computeStageScroll, STAGE_BOUNDARIES } from "./useStageScroll";

describe("STAGE_BOUNDARIES", () => {
  it("matches the spec values", () => {
    expect(STAGE_BOUNDARIES).toEqual({
      skyToForestStart: 1.2,
      skyToForestEnd: 1.5,
      forestToUndergroundStart: 2.5,
      forestToUndergroundEnd: 2.8,
    });
  });
});

describe("computeStageScroll — stage", () => {
  it("returns 'sky' at scroll=0", () => {
    expect(computeStageScroll(0).stage).toBe("sky");
  });
  it("returns 'sky' just before the sky→forest blend", () => {
    expect(computeStageScroll(1.19).stage).toBe("sky");
  });
  it("returns 'forest' at the end of the sky→forest blend", () => {
    expect(computeStageScroll(1.5).stage).toBe("forest");
  });
  it("returns 'forest' inside the forest core", () => {
    expect(computeStageScroll(2.0).stage).toBe("forest");
  });
  it("returns 'underground' at the end of the forest→underground blend", () => {
    expect(computeStageScroll(2.8).stage).toBe("underground");
  });
  it("returns 'underground' deep underground", () => {
    expect(computeStageScroll(5).stage).toBe("underground");
  });
});

describe("computeStageScroll — volumeMultiplier", () => {
  it("returns 0.5 deep in the sky", () => {
    expect(computeStageScroll(0).volumeMultiplier).toBeCloseTo(0.5);
  });
  it("returns 0.5 at the start of the sky→forest blend", () => {
    expect(computeStageScroll(1.2).volumeMultiplier).toBeCloseTo(0.5);
  });
  it("ramps linearly inside the sky→forest blend", () => {
    // midpoint of [1.2, 1.5] is 1.35 → linear midpoint between 0.5 and 1.0 is 0.75
    expect(computeStageScroll(1.35).volumeMultiplier).toBeCloseTo(0.75);
  });
  it("returns 1.0 at the end of the sky→forest blend", () => {
    expect(computeStageScroll(1.5).volumeMultiplier).toBeCloseTo(1.0);
  });
  it("returns 1.0 inside the forest core", () => {
    expect(computeStageScroll(2.0).volumeMultiplier).toBeCloseTo(1.0);
  });
  it("ramps linearly inside the forest→underground blend", () => {
    // midpoint of [2.5, 2.8] is 2.65 → linear midpoint between 1.0 and 0.5 is 0.75
    expect(computeStageScroll(2.65).volumeMultiplier).toBeCloseTo(0.75);
  });
  it("returns 0.5 at the end of the forest→underground blend", () => {
    expect(computeStageScroll(2.8).volumeMultiplier).toBeCloseTo(0.5);
  });
  it("returns 0.5 deep underground", () => {
    expect(computeStageScroll(5).volumeMultiplier).toBeCloseTo(0.5);
  });
});

describe("computeStageScroll — vignetteColor", () => {
  it("returns sky tint in the sky", () => {
    expect(computeStageScroll(0).vignetteColor).toBe("rgba(10, 14, 31, 0.85)");
  });
  it("returns forest tint inside the forest core", () => {
    expect(computeStageScroll(2.0).vignetteColor).toBe("rgba(26, 20, 16, 0.85)");
  });
  it("returns underground tint deep underground", () => {
    expect(computeStageScroll(5).vignetteColor).toBe("rgba(14, 9, 5, 0.85)");
  });
  it("interpolates RGB channels in the sky→forest blend midpoint", () => {
    // midpoint between sky (10,14,31) and forest (26,20,16) is mathematically
    // (18,17,23.5); the actual blend factor at scroll=1.35 lands just below 0.5
    // due to floating-point arithmetic on the boundary subtraction, so the
    // blue channel rounds down to 23 rather than up to 24.
    expect(computeStageScroll(1.35).vignetteColor).toBe("rgba(18, 17, 23, 0.85)");
  });
  it("interpolates RGB channels in the forest→underground blend midpoint", () => {
    // midpoint between forest (26,20,16) and underground (14,9,5) is (20,14.5,10.5)→(20,15,11) rounded
    expect(computeStageScroll(2.65).vignetteColor).toBe("rgba(20, 15, 11, 0.85)");
  });
});
