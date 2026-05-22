import { describe, it, expect, vi } from "vitest";
import type { WebGLRenderer } from "three";
import { disposeRendererForStrictModeSafety } from "./useThreeSceneMount";

// Regression: a prior version of the cleanup called renderer.forceContextLoss()
// after renderer.dispose(), which broke React 19 StrictMode dev double-mount.
// The canvas DOM element persists across mount → cleanup → mount, so forcing
// the WebGL context lost in the first cleanup left the second mount's
// `new WebGLRenderer({ canvas })` with a dead context. three.js then crashed
// inside its shader-precision probe ("Cannot read properties of null
// (reading 'precision')"). dispose() alone is the StrictMode-safe path.
describe("disposeRendererForStrictModeSafety", () => {
  it("calls renderer.dispose()", () => {
    const dispose = vi.fn();
    const forceContextLoss = vi.fn();
    const renderer = { dispose, forceContextLoss } as unknown as WebGLRenderer;

    disposeRendererForStrictModeSafety(renderer);

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call renderer.forceContextLoss() — StrictMode-safe", () => {
    const dispose = vi.fn();
    const forceContextLoss = vi.fn();
    const renderer = { dispose, forceContextLoss } as unknown as WebGLRenderer;

    disposeRendererForStrictModeSafety(renderer);

    expect(forceContextLoss).not.toHaveBeenCalled();
  });
});
