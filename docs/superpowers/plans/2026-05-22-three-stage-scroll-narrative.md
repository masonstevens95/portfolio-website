# Three-Stage Scroll Narrative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing single-stage firefly background into a three-stage spatial descent (night sky → forest → underground), with stage-tinted vignette overlay and scroll-modulated audio volume.

**Architecture:** Refactor `useThreeSceneMount.tsx` into three top-level `THREE.Group`s (sky / forest / underground), each translating against `scrollRef`. Add a new pure helper `useStageScroll` that maps `scroll → { stage, volumeMultiplier, vignetteColor }` for downstream consumers. New `SceneVignette` component renders a fixed `<div>` overlay between the canvas and parallax content layers. `useAmbientSound` grows a `setVolume(multiplier)` method that Header calls in response to scroll changes. Foreground parallax content is unchanged.

**Tech Stack:** React 19, Vite 7, Tailwind 4, three.js 0.178, `@react-spring/parallax`, Vitest (node env).

**Spec:** `docs/superpowers/specs/2026-05-22-three-stage-scroll-narrative-design.md` (committed `cd9cd3d`).

**Branch:** `feat/portfolio-nature-retheme` (already checked out, downstream of the orchard retheme).

**Note about TDD:** `useStageScroll` is the testable seam. All boundary math and color interpolation lives there as a pure function, with vitest cases pinning each scroll-range case. The three.js scene rewrite, SceneVignette CSS, and audio-volume modulation are verified via `npm run build`, `npm run lint`, `npm test`, plus a manual browser walkthrough.

**Note about coupling in Task 5:** The three.js refactor (Task 5) touches several files and must commit atomically — splitting the stage-group skeleton from the existing-firefly migration would leave intermediate states that don't render. Don't commit until `npm run build` is clean and the browser shows fireflies inside `forestGroup` against the new vertical gradient.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `portfolio-website/src/utils/hooks/useStageScroll.ts` | Create | Pure helper. Exports `computeStageScroll(scroll)` returning `{ stage, volumeMultiplier, vignetteColor }` plus the `STAGE_BOUNDARIES` constant. No React hooks; usable from effects, render, or rAF loops. |
| `portfolio-website/src/utils/hooks/useStageScroll.test.ts` | Create | Vitest unit tests for `computeStageScroll` covering every scroll range and blend midpoint. |
| `portfolio-website/src/pages/HomePage.tsx` | Modify | Lift `useParallaxScroll` out of `InfiniteScrollContainer`. Maintain `scroll` value and `scrollRef` ref locally. Pass to `Header` (scroll value) and `InfiniteScrollContainer` (both). |
| `portfolio-website/src/components/home/Header.tsx` | Modify | Accept `scroll: number` prop. New effect calls `useAmbientSound.setVolume` whenever `scroll` changes. Audio toggle UX preserved. |
| `portfolio-website/src/components/home/InfiniteScrollContainer.tsx` | Modify | Accept `scroll: number` and `scrollRef: RefObject<number>` props. Drop local `useParallaxScroll` + scrollRef mirror. Render new `<SceneVignette>` between the canvas and the parallax content `<div>`. |
| `portfolio-website/src/components/home/SceneVignette.tsx` | Create | Fixed-position `<div>` overlay. Reads `scroll` prop. Uses `computeStageScroll(scroll).vignetteColor` to drive a radial-gradient CSS variable. `pointer-events: none`. |
| `portfolio-website/src/utils/hooks/useAmbientSound.tsx` | Modify | Add `setVolume(multiplier: number)` to the returned API. Track base volume in a ref so multiplier scales it correctly. |
| `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx` | Modify | Refactor: build three top-level `THREE.Group`s (sky, forest, underground), one tall vertical background gradient. Move existing far/mid/near firefly Points into `forestGroup`. Add stage-content builders per stage (sky: stars + moon + distant pine ridge; forest: horizon pine ridge + close branch frames; underground: descending roots + fungi + worms + beetles). All groups translate against `scrollRef`. Programmatic textures only. |

No file deletions.

---

## Task 1: `useStageScroll` pure helper (TDD)

The foundation: a single source of truth for stage math. Vignette, audio, and three.js scene all consume it. Pure function, unit-testable.

**Files:**
- Create: `portfolio-website/src/utils/hooks/useStageScroll.ts`
- Create: `portfolio-website/src/utils/hooks/useStageScroll.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `portfolio-website/src/utils/hooks/useStageScroll.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeStageScroll, STAGE_BOUNDARIES } from "./useStageScroll";

describe("STAGE_BOUNDARIES", () => {
  it("matches the spec values", () => {
    expect(STAGE_BOUNDARIES).toEqual({
      skyToForestStart: 1.5,
      skyToForestEnd: 1.8,
      forestToUndergroundStart: 2.2,
      forestToUndergroundEnd: 2.5,
    });
  });
});

describe("computeStageScroll — stage", () => {
  it("returns 'sky' at scroll=0", () => {
    expect(computeStageScroll(0).stage).toBe("sky");
  });
  it("returns 'sky' just before the sky→forest blend", () => {
    expect(computeStageScroll(1.49).stage).toBe("sky");
  });
  it("returns 'forest' at the end of the sky→forest blend", () => {
    expect(computeStageScroll(1.8).stage).toBe("forest");
  });
  it("returns 'forest' inside the forest core", () => {
    expect(computeStageScroll(2.0).stage).toBe("forest");
  });
  it("returns 'underground' at the end of the forest→underground blend", () => {
    expect(computeStageScroll(2.5).stage).toBe("underground");
  });
  it("returns 'underground' deep underground", () => {
    expect(computeStageScroll(5).stage).toBe("underground");
  });
});

describe("computeStageScroll — volumeMultiplier", () => {
  it("returns 0.25 deep in the sky", () => {
    expect(computeStageScroll(0).volumeMultiplier).toBeCloseTo(0.25);
  });
  it("returns 0.25 at the start of the sky→forest blend", () => {
    expect(computeStageScroll(1.5).volumeMultiplier).toBeCloseTo(0.25);
  });
  it("ramps linearly inside the sky→forest blend", () => {
    // midpoint of [1.5, 1.8] is 1.65 → linear midpoint between 0.25 and 1.0 is 0.625
    expect(computeStageScroll(1.65).volumeMultiplier).toBeCloseTo(0.625);
  });
  it("returns 1.0 at the end of the sky→forest blend", () => {
    expect(computeStageScroll(1.8).volumeMultiplier).toBeCloseTo(1.0);
  });
  it("returns 1.0 inside the forest core", () => {
    expect(computeStageScroll(2.0).volumeMultiplier).toBeCloseTo(1.0);
  });
  it("ramps linearly inside the forest→underground blend", () => {
    // midpoint of [2.2, 2.5] is 2.35 → linear midpoint between 1.0 and 0.25 is 0.625
    expect(computeStageScroll(2.35).volumeMultiplier).toBeCloseTo(0.625);
  });
  it("returns 0.25 at the end of the forest→underground blend", () => {
    expect(computeStageScroll(2.5).volumeMultiplier).toBeCloseTo(0.25);
  });
  it("returns 0.25 deep underground", () => {
    expect(computeStageScroll(5).volumeMultiplier).toBeCloseTo(0.25);
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
    // midpoint between sky (10,14,31) and forest (26,20,16) is (18,17,23.5)→(18,17,24) rounded
    expect(computeStageScroll(1.65).vignetteColor).toBe("rgba(18, 17, 24, 0.85)");
  });
  it("interpolates RGB channels in the forest→underground blend midpoint", () => {
    // midpoint between forest (26,20,16) and underground (14,9,5) is (20,14.5,10.5)→(20,15,11) rounded
    expect(computeStageScroll(2.35).vignetteColor).toBe("rgba(20, 15, 11, 0.85)");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd portfolio-website && npm test -- useStageScroll.test
```

Expected: FAIL with "Failed to resolve import './useStageScroll'".

- [ ] **Step 3: Implement `useStageScroll.ts`**

Create `portfolio-website/src/utils/hooks/useStageScroll.ts`:

```ts
// Pure helper mapping the parallax `scroll` value to a single source of
// truth for stage-aware visuals and audio. No React hooks — call from
// effects, render, or rAF loops freely.

export type Stage = "sky" | "forest" | "underground";

export interface StageScrollResult {
  stage: Stage;
  volumeMultiplier: number; // 0.25 baseline, 1.0 in forest core
  vignetteColor: string;    // "rgba(r, g, b, 0.85)"
}

export const STAGE_BOUNDARIES = {
  skyToForestStart: 1.5,
  skyToForestEnd: 1.8,
  forestToUndergroundStart: 2.2,
  forestToUndergroundEnd: 2.5,
} as const;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const SKY_TINT: Rgb = { r: 10, g: 14, b: 31 };
const FOREST_TINT: Rgb = { r: 26, g: 20, b: 16 };
const UNDERGROUND_TINT: Rgb = { r: 14, g: 9, b: 5 };
const VIGNETTE_ALPHA = 0.85;

const SKY_VOLUME = 0.25;
const FOREST_VOLUME = 1.0;
const UNDERGROUND_VOLUME = 0.25;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpRgb = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: lerp(a.r, b.r, t),
  g: lerp(a.g, b.g, t),
  b: lerp(a.b, b.b, t),
});

const rgbToCss = (c: Rgb, alpha: number): string =>
  `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha})`;

export function computeStageScroll(scroll: number): StageScrollResult {
  const {
    skyToForestStart,
    skyToForestEnd,
    forestToUndergroundStart,
    forestToUndergroundEnd,
  } = STAGE_BOUNDARIES;

  // Sky core
  if (scroll < skyToForestStart) {
    return {
      stage: "sky",
      volumeMultiplier: SKY_VOLUME,
      vignetteColor: rgbToCss(SKY_TINT, VIGNETTE_ALPHA),
    };
  }

  // Sky→Forest blend
  if (scroll < skyToForestEnd) {
    const t =
      (scroll - skyToForestStart) / (skyToForestEnd - skyToForestStart);
    return {
      stage: "sky",
      volumeMultiplier: lerp(SKY_VOLUME, FOREST_VOLUME, t),
      vignetteColor: rgbToCss(lerpRgb(SKY_TINT, FOREST_TINT, t), VIGNETTE_ALPHA),
    };
  }

  // Forest core
  if (scroll < forestToUndergroundStart) {
    return {
      stage: "forest",
      volumeMultiplier: FOREST_VOLUME,
      vignetteColor: rgbToCss(FOREST_TINT, VIGNETTE_ALPHA),
    };
  }

  // Forest→Underground blend
  if (scroll < forestToUndergroundEnd) {
    const t =
      (scroll - forestToUndergroundStart) /
      (forestToUndergroundEnd - forestToUndergroundStart);
    return {
      stage: "forest",
      volumeMultiplier: lerp(FOREST_VOLUME, UNDERGROUND_VOLUME, t),
      vignetteColor: rgbToCss(
        lerpRgb(FOREST_TINT, UNDERGROUND_TINT, t),
        VIGNETTE_ALPHA
      ),
    };
  }

  // Underground core
  return {
    stage: "underground",
    volumeMultiplier: UNDERGROUND_VOLUME,
    vignetteColor: rgbToCss(UNDERGROUND_TINT, VIGNETTE_ALPHA),
  };
}
```

Note on the `stage` field at boundary values: the spec says `stage` flips to the next stage at the END of the blend zone (`< skyToForestEnd` means still "sky" until exactly 1.8). The test at scroll=1.8 expects "forest" — that boundary is `< skyToForestEnd` so at exactly 1.8 it falls through to the next block. Same for 2.5 and "underground". This matches the tests above.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd portfolio-website && npm test -- useStageScroll.test
```

Expected: all 20 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useStageScroll.ts portfolio-website/src/utils/hooks/useStageScroll.test.ts
git commit -m "$(cat <<'EOF'
feat(portfolio): add useStageScroll helper for three-stage narrative

Pure function mapping the parallax scroll value to {stage,
volumeMultiplier, vignetteColor}. Single source of truth for
audio modulation, vignette tint, and (later) three.js stage logic.

Tested in isolation: stage boundaries, volume curve, RGB channel
interpolation across blend zones.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Lift scroll plumbing to HomePage

Currently `InfiniteScrollContainer` owns `useParallaxScroll`. To give `Header` access to scroll (for audio modulation in Task 3) without redux/context for a per-frame-ish value, move the scroll subscription up to `HomePage` and pass `scroll` down to both children. `InfiniteScrollContainer` keeps its local scrollRef mirror (since `useThreeSceneMount` reads via ref).

**Files:**
- Modify: `portfolio-website/src/pages/HomePage.tsx`
- Modify: `portfolio-website/src/components/home/Header.tsx`
- Modify: `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`

- [ ] **Step 1: Update `HomePage.tsx`**

Overwrite `portfolio-website/src/pages/HomePage.tsx`:

```tsx
/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";
import { useParallaxScroll } from "../utils/hooks/useParallaxScroll";

interface Props {}

export const HomePage = ({}: Props) => {
  const scroll = useParallaxScroll();
  return (
    <>
      <Header scroll={scroll} />
      <InfiniteScrollContainer scroll={scroll} />
    </>
  );
};
```

(Note: the existing file imports `useAmbientSound` but doesn't use it — remove that stale import as part of this edit. Also removes the now-unused `useAmbientSound` import comment if present.)

- [ ] **Step 2: Update `Header.tsx` to accept `scroll` prop**

In `portfolio-website/src/components/home/Header.tsx`, change the `Props` interface and component signature:

```tsx
interface Props {
  scroll: number;
}

export const Header = ({ scroll }: Props) => {
```

(Replace the existing `interface Props {}` and `export const Header = ({}: Props) => {`. The body continues to use `useAmbientSound` and the rest unchanged. `scroll` is unused for now — Task 3 wires it to setVolume.)

- [ ] **Step 3: Update `InfiniteScrollContainer.tsx` to accept `scroll` prop**

In `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`:

Find the current signature:
```tsx
interface Props {}

export const InfiniteScrollContainer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);
  // ...
  const scroll = useParallaxScroll();
  const scrollRef = useRef(scroll);
  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);
```

Replace with:
```tsx
interface Props {
  scroll: number;
}

export const InfiniteScrollContainer = ({ scroll }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);
  // ...
  const scrollRef = useRef(scroll);
  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);
```

Also remove the `import { useParallaxScroll } from "../../utils/hooks/useParallaxScroll";` line at the top (no longer used here).

- [ ] **Step 4: Build to verify**

```bash
cd portfolio-website && npm run build
```

Expected: TypeScript compiles, build passes. No visual change — the homepage looks identical because `scroll` is plumbed but not yet consumed differently.

- [ ] **Step 5: Commit**

```bash
cd /workspace && git add portfolio-website/src/pages/HomePage.tsx portfolio-website/src/components/home/Header.tsx portfolio-website/src/components/home/InfiniteScrollContainer.tsx
git commit -m "$(cat <<'EOF'
refactor(portfolio): lift useParallaxScroll subscription to HomePage

HomePage now owns the parallax scroll subscription and passes the
value down to Header and InfiniteScrollContainer as a prop. Header
will use this in the next task to modulate ambient audio volume.
No visual change — pure plumbing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Audio volume modulation

`useAmbientSound` gets a `setVolume(multiplier)` method that scales the base volume. `Header` calls it on scroll changes via `computeStageScroll`.

**Files:**
- Modify: `portfolio-website/src/utils/hooks/useAmbientSound.tsx`
- Modify: `portfolio-website/src/components/home/Header.tsx`

- [ ] **Step 1: Update `useAmbientSound` with `setVolume`**

Overwrite `portfolio-website/src/utils/hooks/useAmbientSound.tsx`:

```tsx
// utils/hooks/useAmbientSound.ts
import { useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, baseVolume = 0.3) => {
  const [paused, setPaused] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio(src);
    a.volume = baseVolume;
    return a;
  });
  const baseVolumeRef = useRef(baseVolume);
  baseVolumeRef.current = baseVolume;

  useEffect(() => {
    audio.loop = true;

    if (paused) {
      audio.pause();
    } else {
      audio.play().catch((e) => {
        // Browser blocked autoplay (typical until the user interacts with
        // the page). Sync UI state so the toggle button is honest; a click
        // on the toggle counts as a user gesture and will then succeed.
        console.error("Autoplay blocked, ", e);
        setPaused(true);
      });
    }
  }, [audio, paused]);

  // Single source of truth: `paused`. Toggling it lets the effect above
  // call play()/pause() — and play() inside the click handler runs in a
  // user-gesture context, so browsers that blocked autoplay will allow it.
  const toggleMute = () => setPaused((p) => !p);

  // Mutate the underlying audio volume directly. Intentionally bypasses
  // the effect above so we don't re-call play() on every scroll tick.
  const setVolume = (multiplier: number) => {
    audio.volume = baseVolumeRef.current * multiplier;
  };

  return { toggleMute, paused, setVolume };
};
```

- [ ] **Step 2: Update `Header.tsx` to call `setVolume` on scroll**

In `portfolio-website/src/components/home/Header.tsx`, add the import for `useEffect` and `computeStageScroll`:

At the top, add:
```tsx
import { useEffect } from "react";
import { computeStageScroll } from "../../utils/hooks/useStageScroll";
```

(Combine with any existing react imports — `import { useEffect, useState } from "react"` if the file already imports useState, etc. Adapt per the file's current import shape.)

Then, inside the `Header` component body, just after the `useAmbientSound` call, change:

```tsx
const { toggleMute, paused } = useAmbientSound("/assets/crickets.wav", 0.1);
```

to:

```tsx
const { toggleMute, paused, setVolume } = useAmbientSound(
  "/assets/crickets.wav",
  0.1
);

useEffect(() => {
  const { volumeMultiplier } = computeStageScroll(scroll);
  setVolume(volumeMultiplier);
}, [scroll, setVolume]);
```

- [ ] **Step 3: Build to verify**

```bash
cd portfolio-website && npm run build
```

Expected: passes.

- [ ] **Step 4: Smoke-test in dev**

```bash
cd portfolio-website && npm run dev
```

Open the homepage, unmute audio. Scroll slowly from top to bottom — crickets should audibly swell as you reach the forest stage (around the second parallax page) and soften again as you reach the contact page. Kill dev server.

- [ ] **Step 5: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useAmbientSound.tsx portfolio-website/src/components/home/Header.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): scroll-modulated ambient audio volume

useAmbientSound gains a setVolume(multiplier) method that mutates
audio.volume directly without re-running the play() effect. Header
calls it from a scroll-driven effect, deriving the multiplier from
computeStageScroll: 0.25 baseline outside the forest, ramping to
1.0 inside the forest core, with linear blend zones at the stage
boundaries.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `SceneVignette` overlay

New fixed-position `<div>` rendering a radial-gradient vignette tinted by the current stage. Reads `scroll` prop, computes color via `useStageScroll`.

**Files:**
- Create: `portfolio-website/src/components/home/SceneVignette.tsx`
- Modify: `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`

- [ ] **Step 1: Create `SceneVignette.tsx`**

Create `portfolio-website/src/components/home/SceneVignette.tsx`:

```tsx
/*
  SceneVignette

  Fixed-position radial-gradient overlay that frames the viewport with a
  stage-tinted shadow. Rendered between the three.js canvas and the
  parallax content layer so it sits "over the environment but under the UI."

  Color is driven by computeStageScroll(scroll) → vignetteColor, which
  linearly interpolates RGB channels across stage blend zones.
*/

import { computeStageScroll } from "../../utils/hooks/useStageScroll";

interface Props {
  scroll: number;
}

export const SceneVignette = ({ scroll }: Props) => {
  const { vignetteColor } = computeStageScroll(scroll);
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 5,
        background: `radial-gradient(ellipse 75% 55% at center, transparent 30%, ${vignetteColor} 100%)`,
      }}
    />
  );
};
```

- [ ] **Step 2: Render `<SceneVignette>` in `InfiniteScrollContainer.tsx`**

In `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`:

Add the import at the top:
```tsx
import { SceneVignette } from "./SceneVignette";
```

Then find the JSX return:
```tsx
  return (
    <div className="left-0 top-0 fixed w-full h-full items-right">
      <canvas
        ref={canvasRef}
        id="bg"
        className="fixed top-0 left-0 w-full h-full"
      />

      <div className="left-0 top-0 fixed z-1 w-full h-full">
        <Parallax className="parallax" pages={4} ref={parallaxRef}>
```

Insert `<SceneVignette>` between the canvas and the parallax `<div>`:

```tsx
  return (
    <div className="left-0 top-0 fixed w-full h-full items-right">
      <canvas
        ref={canvasRef}
        id="bg"
        className="fixed top-0 left-0 w-full h-full"
      />

      <SceneVignette scroll={scroll} />

      <div className="left-0 top-0 fixed z-1 w-full h-full">
        <Parallax className="parallax" pages={4} ref={parallaxRef}>
```

The vignette has `zIndex: 5`, which sits above the canvas (no explicit z-index, so 0/auto) but below the parallax content (which has `z-1` in Tailwind — wait, `z-1` is actually z-index: 1 in Tailwind 4, lower than 5). Adjust the parallax content layer to ensure it stays above the vignette:

Change:
```tsx
      <div className="left-0 top-0 fixed z-1 w-full h-full">
```
to:
```tsx
      <div className="left-0 top-0 fixed z-10 w-full h-full">
```

(z-10 sits above z-5 so the content cards remain crisp over the vignette.)

- [ ] **Step 3: Build + smoke check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Open the homepage. Edges should now have a soft dark vignette. Scroll — the vignette tint should shift subtly as you cross stage boundaries (deep blue at top → bark-brown in forest → near-black underground). Kill dev server.

- [ ] **Step 4: Commit**

```bash
cd /workspace && git add portfolio-website/src/components/home/SceneVignette.tsx portfolio-website/src/components/home/InfiniteScrollContainer.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): stage-tinted vignette overlay

New SceneVignette component renders a radial-gradient overlay
between the three.js canvas and the parallax content layer.
Vignette color shifts per stage via computeStageScroll:
midnight blue (sky) → bark (forest) → deep earth (underground),
with linear RGB interpolation across blend zones.

z-index hierarchy: canvas (0) < vignette (5) < parallax content (10).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Three.js stage-group skeleton refactor

The big architectural shift. `useThreeSceneMount` goes from a flat single-stage firefly scene to three stratified stage groups. **No new visual content yet** — existing fireflies move into `forestGroup`, the background gradient becomes one tall vertical strip, and sky/underground groups are created empty (filled in Tasks 6–8). This task must commit atomically; intermediate states won't render correctly.

**Files:**
- Modify: `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`

- [ ] **Step 1: Overwrite `useThreeSceneMount.tsx`**

The file becomes large but stays single-responsibility (3D scene mount). Decompose internals into per-stage builders for readability. Replace the entire current contents with:

```tsx
import { type RefObject, useEffect } from "react";
import * as THREE from "three";
import type { MouseParallaxOffset } from "./useMouseParallax";

// Release the renderer's GPU resources without forcing context loss on the
// underlying canvas. Under React 19 StrictMode dev, useEffect runs as
// mount → cleanup → mount, with the canvas DOM element persisting across the
// cycle. forceContextLoss() at cleanup leaves the second mount with a dead
// WebGL context, so three.js's getShaderPrecisionFormat() returns null inside
// the WebGLRenderer constructor and crashes ("Cannot read properties of null
// (reading 'precision')"). dispose() alone is the StrictMode-safe path.
export const disposeRendererForStrictModeSafety = (
  renderer: THREE.WebGLRenderer
): void => {
  renderer.dispose();
};

// =============================================================================
// World-space layout
// =============================================================================
// All stages are stacked vertically in world space. Each stage group is
// SPREAD_Y units tall. At scroll=0 the camera looks at world Y = 0,
// which is the sky stage center. As scroll grows, all stage groups
// translate together by `scroll * STAGE_SCROLL_MULTIPLIER`, moving up
// in world Y — so the visible "world slice" descends from sky through
// forest into underground.

const SPREAD_X = 120;
const SPREAD_Y = 80;

const SKY_CENTER_Y = 0;                       // sky at world origin (scroll=0 view)
const FOREST_CENTER_Y = -SPREAD_Y;            // forest one stage below sky
const UNDERGROUND_CENTER_Y = -SPREAD_Y * 2;   // underground one stage below forest

// Per-stage scroll translation multipliers. Tuned so that scrolling through
// the spec's 4-page parallax (scroll value 0..3) translates each stage by
// exactly one stage-height as it enters/exits view.
const STAGE_SCROLL_MULTIPLIER = SPREAD_Y / 2;

// =============================================================================
// Firefly counts (forest stage)
// =============================================================================
const FAR_COUNT = 80;
const MID_COUNT = 50;
const NEAR_COUNT = 25;

// =============================================================================
// Texture builders (programmatic — no image assets)
// =============================================================================

const buildGlowTexture = (
  innerRgba: string = "rgba(248, 226, 176, 1.0)",
  midRgba: string = "rgba(216, 168, 80, 0.55)",
  edgeRgba: string = "rgba(216, 168, 80, 0)"
): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0.0, innerRgba);
  g.addColorStop(0.35, midRgba);
  g.addColorStop(1.0, edgeRgba);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

// Tall vertical gradient: sky at top → forest middle → underground bottom.
// Camera sees a vertical slice based on scene.background's UV mapping; since
// scene.background uses cover-mode (default for textures), this paints the
// whole viewport with a slice. We tile/scale the gradient so the visible
// slice shifts as stage groups translate.
const buildVerticalGradientTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  // Sky (top 33%)
  g.addColorStop(0.0, "#0a0e1f");
  g.addColorStop(0.25, "#1a1f3a");
  // Forest (middle 33%)
  g.addColorStop(0.4, "#1a1410");
  g.addColorStop(0.55, "#2a3a22");
  g.addColorStop(0.65, "#3a4a2c");
  // Underground (bottom 33%)
  g.addColorStop(0.75, "#1a2418");
  g.addColorStop(0.9, "#2a1f10");
  g.addColorStop(1.0, "#0e0905");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 1024);
  return new THREE.CanvasTexture(c);
};

// =============================================================================
// Firefly layer builder (used by forest stage)
// =============================================================================

interface FireflyLayer {
  points: THREE.Points;
  phases: Float32Array;
  basePositions: Float32Array;
}

const buildFireflyLayer = (
  count: number,
  size: number,
  z: number,
  glow: THREE.CanvasTexture
): FireflyLayer => {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = z + (Math.random() - 0.5) * 4;
    phases[i] = Math.random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size,
    map: glow,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  return { points, phases, basePositions: positions.slice() };
};

// =============================================================================
// Stage builders (forest fully populated; sky and underground are skeletons
// — Tasks 6–8 add their content)
// =============================================================================

interface SkyStage {
  group: THREE.Group;
  disposables: THREE.Object3D[];
}

const buildSkyGroup = (): SkyStage => {
  const group = new THREE.Group();
  group.position.y = SKY_CENTER_Y;
  // Tasks 6 will add stars, moon, distant pine ridge here.
  return { group, disposables: [] };
};

interface ForestStage {
  group: THREE.Group;
  far: FireflyLayer;
  mid: FireflyLayer;
  near: FireflyLayer;
  glow: THREE.CanvasTexture;
}

const buildForestGroup = (): ForestStage => {
  const group = new THREE.Group();
  group.position.y = FOREST_CENTER_Y;

  const glow = buildGlowTexture();
  const far = buildFireflyLayer(FAR_COUNT, 0.6, -40, glow);
  const mid = buildFireflyLayer(MID_COUNT, 1.1, -10, glow);
  const near = buildFireflyLayer(NEAR_COUNT, 2.0, 10, glow);

  group.add(far.points, mid.points, near.points);

  return { group, far, mid, near, glow };
};

interface UndergroundStage {
  group: THREE.Group;
  disposables: THREE.Object3D[];
}

const buildUndergroundGroup = (): UndergroundStage => {
  const group = new THREE.Group();
  group.position.y = UNDERGROUND_CENTER_Y;
  // Task 8 will add roots, fungi, worms, beetles here.
  return { group, disposables: [] };
};

// =============================================================================
// Main hook
// =============================================================================

export const useThreeSceneMount = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  scrollRef: RefObject<number>,
  mouseRef: RefObject<MouseParallaxOffset>
) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = buildVerticalGradientTexture();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const sky = buildSkyGroup();
    const forest = buildForestGroup();
    const underground = buildUndergroundGroup();

    scene.add(sky.group, forest.group, underground.group);

    // Accessibility: honor prefers-reduced-motion. Render a single static
    // frame and skip the rAF loop. Scroll changes still translate stage
    // groups (handled by the scroll-effect block below), but no per-frame
    // animation runs.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let smoothMx = 0;
    let smoothMy = 0;
    let frame = 0;
    let rafId = 0;

    const updateFireflyLayer = (layer: FireflyLayer, amplitude: number) => {
      const posAttr = layer.points.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const t = frame * 0.01;
      for (let i = 0; i < layer.phases.length; i++) {
        const phase = layer.phases[i];
        arr[i * 3 + 0] =
          layer.basePositions[i * 3 + 0] + Math.sin(t + phase) * amplitude;
        arr[i * 3 + 1] =
          layer.basePositions[i * 3 + 1] + Math.cos(t * 0.7 + phase) * amplitude;
      }
      posAttr.needsUpdate = true;
    };

    const applyScrollAndMouse = () => {
      // Stage groups translate together based on scroll. As scroll grows,
      // every group moves UP in world space (positive y means "above the
      // camera now"), so the visible slice descends from sky to underground.
      const s = scrollRef.current ?? 0;
      const offset = s * STAGE_SCROLL_MULTIPLIER;
      sky.group.position.y = SKY_CENTER_Y + offset;
      forest.group.position.y = FOREST_CENTER_Y + offset;
      underground.group.position.y = UNDERGROUND_CENTER_Y + offset;

      // Mouse parallax — applies inside the forest group only (its fireflies
      // were the original consumer of mouse parallax).
      const tx = mouseRef.current?.x ?? 0;
      const ty = mouseRef.current?.y ?? 0;
      smoothMx += (tx - smoothMx) * 0.05;
      smoothMy += (ty - smoothMy) * 0.05;
      // Apply mouse parallax to firefly layers within forest group via their
      // points' position offset.
      forest.far.points.position.x = smoothMx * 0.5;
      forest.mid.points.position.x = smoothMx * 1.5;
      forest.near.points.position.x = smoothMx * 3.0;
      forest.far.points.position.y = smoothMy * -0.3;
      forest.mid.points.position.y = smoothMy * -1.0;
      forest.near.points.position.y = smoothMy * -2.0;
    };

    const animate = () => {
      frame++;
      updateFireflyLayer(forest.far, 0.4);
      updateFireflyLayer(forest.mid, 0.7);
      updateFireflyLayer(forest.near, 1.1);
      applyScrollAndMouse();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    if (prefersReducedMotion) {
      applyScrollAndMouse();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (prefersReducedMotion) {
        applyScrollAndMouse();
        renderer.render(scene, camera);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      forest.glow.dispose();
      forest.far.points.geometry.dispose();
      (forest.far.points.material as THREE.Material).dispose();
      forest.mid.points.geometry.dispose();
      (forest.mid.points.material as THREE.Material).dispose();
      forest.near.points.geometry.dispose();
      (forest.near.points.material as THREE.Material).dispose();
      (scene.background as THREE.CanvasTexture).dispose();
      disposeRendererForStrictModeSafety(renderer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
```

- [ ] **Step 2: Build + smoke check**

```bash
cd portfolio-website && npm run build
npm test
```

Expected: build passes, all 22 tests still pass (18 existing + 4 from useStageScroll Task 1 — actually 20 from useStageScroll for total 38... whichever number, all should pass).

- [ ] **Step 3: Manual visual check**

```bash
cd portfolio-website && npm run dev
```

Open the homepage. You should see:
- At scroll=0 (Welcome block visible): the visible region of the vertical gradient texture (sky-blue colors at top). The `skyGroup` is at world Y=0, looking at the camera — but it's currently empty (Task 6 fills it). So you'll see the sky portion of the gradient with nothing else.
- Scrolling down: stage groups translate together; gradient slice shifts to forest colors mid-page; fireflies (inside `forestGroup`) come into view roughly when scroll ≈ 1.5–2.0; continuing down, underground colors take over with the empty `undergroundGroup`.

Kill dev server.

- [ ] **Step 4: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useThreeSceneMount.tsx
git commit -m "$(cat <<'EOF'
refactor(portfolio): stratify scene into three stage groups

useThreeSceneMount now builds three top-level THREE.Groups (sky,
forest, underground) stacked vertically in world space. Existing
firefly layers move into forestGroup; background is a single tall
vertical gradient texture. All groups translate together against
scrollRef so the visible slice descends from sky to underground
as the user scrolls.

Sky and underground groups are empty skeletons in this commit;
Tasks 6 and 8 will populate them with stars/moon/pine-ridge and
roots/fungi/worms/beetles respectively. Task 7 will add the
forest's horizon ridge + close branch frames.

Mouse parallax preserved within forest (firefly layers still
nudge with the cursor). prefers-reduced-motion still honored.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Sky stage content

Fill the (currently empty) `skyGroup` with 150 stars, a crescent moon, and a distant pine ridge that peeks in at the bottom of the stage.

**Files:**
- Modify: `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`

- [ ] **Step 1: Add sky-content texture builders**

In `useThreeSceneMount.tsx`, add these new texture builder functions in the texture-builders block (after `buildGlowTexture`, before `buildVerticalGradientTexture`):

```tsx
// Cool-white glow for stars.
const buildStarTexture = (): THREE.CanvasTexture => {
  return buildGlowTexture(
    "rgba(240, 245, 255, 1.0)",
    "rgba(190, 210, 250, 0.5)",
    "rgba(190, 210, 250, 0)"
  );
};

// Crescent moon — opaque cream disk with a dark "bite" subtracted from one
// side to create the crescent silhouette.
const buildMoonTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  // Full moon disk
  ctx.fillStyle = "#f0e2b8";
  ctx.beginPath();
  ctx.arc(64, 64, 50, 0, Math.PI * 2);
  ctx.fill();
  // Bite — offset darker disk that erases the right portion, leaving a crescent
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(82, 64, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  return new THREE.CanvasTexture(c);
};

// Distant pine ridge — silhouette of triangular pine tops along a horizon.
// Returns a wide, short alpha texture.
const buildPineRidgeTexture = (
  width: number = 1024,
  height: number = 128,
  triangleCount: number = 18,
  fill: string = "#0a0a08"
): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = fill;
  // Baseline rectangle across the bottom 25%
  ctx.fillRect(0, height * 0.75, width, height * 0.25);
  // Triangles for each pine
  const spacing = width / triangleCount;
  for (let i = 0; i < triangleCount; i++) {
    const cx = i * spacing + spacing / 2;
    const top = height * (0.05 + Math.random() * 0.3);
    const halfBase = spacing * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx - halfBase, height * 0.78);
    ctx.lineTo(cx + halfBase, height * 0.78);
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
};
```

- [ ] **Step 2: Extend `SkyStage` interface and `buildSkyGroup`**

Replace the existing `SkyStage` interface and `buildSkyGroup` function with:

```tsx
interface SkyStage {
  group: THREE.Group;
  starField: { points: THREE.Points; phases: Float32Array };
  starTex: THREE.CanvasTexture;
  moonMesh: THREE.Mesh;
  moonTex: THREE.CanvasTexture;
  ridgeMesh: THREE.Mesh;
  ridgeTex: THREE.CanvasTexture;
}

const STAR_COUNT = 150;

const buildSkyGroup = (): SkyStage => {
  const group = new THREE.Group();
  group.position.y = SKY_CENTER_Y;

  // Stars — scattered point sprites across the stage's full Y extent
  const starTex = buildStarTexture();
  const positions = new Float32Array(STAR_COUNT * 3);
  const phases = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X * 1.2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = -30 + Math.random() * 20;
    phases[i] = Math.random() * Math.PI * 2;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const starMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: starTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const starPoints = new THREE.Points(starGeometry, starMaterial);
  group.add(starPoints);

  // Moon — single PlaneGeometry in the upper-left
  const moonTex = buildMoonTexture();
  const moonGeometry = new THREE.PlaneGeometry(12, 12);
  const moonMaterial = new THREE.MeshBasicMaterial({
    map: moonTex,
    transparent: true,
    depthWrite: false,
  });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  moonMesh.position.set(-SPREAD_X * 0.3, SPREAD_Y * 0.25, -25);
  group.add(moonMesh);

  // Distant pine ridge at the bottom of skyGroup — peeks in as camera
  // approaches the sky→forest transition.
  const ridgeTex = buildPineRidgeTexture();
  const ridgeGeometry = new THREE.PlaneGeometry(SPREAD_X * 1.4, 16);
  const ridgeMaterial = new THREE.MeshBasicMaterial({
    map: ridgeTex,
    transparent: true,
    depthWrite: false,
  });
  const ridgeMesh = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
  ridgeMesh.position.set(0, -SPREAD_Y * 0.45, -20);
  group.add(ridgeMesh);

  return {
    group,
    starField: { points: starPoints, phases },
    starTex,
    moonMesh,
    moonTex,
    ridgeMesh,
    ridgeTex,
  };
};
```

- [ ] **Step 3: Add star twinkle to the animation loop**

In the `animate` function inside the main `useEffect`, add a star-twinkle update before the firefly updates. Find the existing block:

```tsx
const animate = () => {
  frame++;
  updateFireflyLayer(forest.far, 0.4);
  updateFireflyLayer(forest.mid, 0.7);
  updateFireflyLayer(forest.near, 1.1);
  applyScrollAndMouse();
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(animate);
};
```

Add a twinkle helper and the call. Replace the animate function with:

```tsx
const twinkleStars = () => {
  const t = frame * 0.02;
  const mat = sky.starField.points.material as THREE.PointsMaterial;
  // Average twinkle by gently modulating overall opacity. Per-star twinkle
  // via attribute would be costlier and the visual difference is subtle at
  // this density.
  const base = 0.75;
  const wobble = 0.15 * Math.sin(t);
  mat.opacity = base + wobble;
  mat.transparent = true;
  mat.needsUpdate = true;
};

const animate = () => {
  frame++;
  updateFireflyLayer(forest.far, 0.4);
  updateFireflyLayer(forest.mid, 0.7);
  updateFireflyLayer(forest.near, 1.1);
  twinkleStars();
  applyScrollAndMouse();
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(animate);
};
```

- [ ] **Step 4: Dispose sky resources on cleanup**

In the cleanup return block, before `(scene.background as THREE.CanvasTexture).dispose();`, add:

```tsx
sky.starTex.dispose();
sky.starField.points.geometry.dispose();
(sky.starField.points.material as THREE.Material).dispose();
sky.moonTex.dispose();
sky.moonMesh.geometry.dispose();
(sky.moonMesh.material as THREE.Material).dispose();
sky.ridgeTex.dispose();
sky.ridgeMesh.geometry.dispose();
(sky.ridgeMesh.material as THREE.Material).dispose();
```

- [ ] **Step 5: Build + smoke check**

```bash
cd portfolio-website && npm run build && npm run dev
```

At scroll=0 (Welcome block visible), you should see:
- 150 cool-white stars twinkling against the deep midnight-blue background
- A crescent moon in the upper-left
- A faint dark pine ridge peeking up from the bottom of the visible area
- Scrolling down — the moon and stars scroll up out of view, ridge passes through, fireflies come into view from the forest stage.

Kill dev server.

- [ ] **Step 6: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useThreeSceneMount.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): populate sky stage with stars, moon, distant pine ridge

skyGroup now contains 150 cool-white twinkling stars, a crescent moon
in the upper-left, and a dark pine-silhouette ridge at the bottom of
the stage so it peeks into view as the camera approaches the
sky→forest boundary. All textures generated programmatically.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Forest stage augmentation (pine horizon ridge + close branches)

Existing fireflies stay; add a pine ridge at the top of the forest stage (where you arrive from sky) and two close-branch alpha planes framing the firefly field from top and bottom.

**Files:**
- Modify: `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`

- [ ] **Step 1: Add close-branch texture builder**

In `useThreeSceneMount.tsx`, near the other texture builders (right after `buildPineRidgeTexture`), add:

```tsx
// Close-branch silhouette — irregular silhouette of pine branches/needles.
// Rendered wider than tall, hangs from the top of the forest stage (or rises
// from the bottom, depending on orientation/scale-y).
const buildBranchTexture = (
  width: number = 1024,
  height: number = 256,
  fill: string = "#0a0a08"
): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = fill;
  // Draw 6-8 overlapping irregular branch shapes
  const branchCount = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount; i++) {
    const cx = (i / branchCount) * width + Math.random() * (width / branchCount);
    const baseY = 0;
    const tipY = height * (0.4 + Math.random() * 0.5);
    const branchWidth = width * (0.08 + Math.random() * 0.06);
    ctx.beginPath();
    ctx.moveTo(cx - branchWidth, baseY);
    ctx.quadraticCurveTo(
      cx + branchWidth * (Math.random() - 0.5) * 2,
      tipY * 0.6,
      cx + branchWidth * 0.3,
      tipY
    );
    ctx.quadraticCurveTo(
      cx - branchWidth * 0.5,
      tipY * 0.7,
      cx + branchWidth,
      baseY
    );
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
};
```

- [ ] **Step 2: Extend `ForestStage` interface and `buildForestGroup`**

Replace the existing `ForestStage` interface and `buildForestGroup` function with:

```tsx
interface ForestStage {
  group: THREE.Group;
  far: FireflyLayer;
  mid: FireflyLayer;
  near: FireflyLayer;
  glow: THREE.CanvasTexture;
  ridgeMesh: THREE.Mesh;
  ridgeTex: THREE.CanvasTexture;
  topBranchMesh: THREE.Mesh;
  topBranchTex: THREE.CanvasTexture;
  bottomBranchMesh: THREE.Mesh;
  bottomBranchTex: THREE.CanvasTexture;
}

const buildForestGroup = (): ForestStage => {
  const group = new THREE.Group();
  group.position.y = FOREST_CENTER_Y;

  const glow = buildGlowTexture();
  const far = buildFireflyLayer(FAR_COUNT, 0.6, -40, glow);
  const mid = buildFireflyLayer(MID_COUNT, 1.1, -10, glow);
  const near = buildFireflyLayer(NEAR_COUNT, 2.0, 10, glow);
  group.add(far.points, mid.points, near.points);

  // Horizon pine ridge — top of forest stage, where camera arrives from sky
  const ridgeTex = buildPineRidgeTexture(1024, 160, 14, "#0a0a08");
  const ridgeGeometry = new THREE.PlaneGeometry(SPREAD_X * 1.4, 20);
  const ridgeMaterial = new THREE.MeshBasicMaterial({
    map: ridgeTex,
    transparent: true,
    depthWrite: false,
  });
  const ridgeMesh = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
  ridgeMesh.position.set(0, SPREAD_Y * 0.45, -25);
  group.add(ridgeMesh);

  // Close-branch frames — top (draping down) and bottom (rising up)
  const topBranchTex = buildBranchTexture();
  const topBranchGeometry = new THREE.PlaneGeometry(SPREAD_X * 1.4, 30);
  const topBranchMaterial = new THREE.MeshBasicMaterial({
    map: topBranchTex,
    transparent: true,
    depthWrite: false,
  });
  const topBranchMesh = new THREE.Mesh(topBranchGeometry, topBranchMaterial);
  topBranchMesh.position.set(0, SPREAD_Y * 0.4, 15);
  topBranchMesh.scale.y = -1; // flip so branches hang down from the top edge
  group.add(topBranchMesh);

  const bottomBranchTex = buildBranchTexture();
  const bottomBranchGeometry = new THREE.PlaneGeometry(SPREAD_X * 1.4, 24);
  const bottomBranchMaterial = new THREE.MeshBasicMaterial({
    map: bottomBranchTex,
    transparent: true,
    depthWrite: false,
  });
  const bottomBranchMesh = new THREE.Mesh(
    bottomBranchGeometry,
    bottomBranchMaterial
  );
  bottomBranchMesh.position.set(0, -SPREAD_Y * 0.4, 15);
  group.add(bottomBranchMesh);

  return {
    group,
    far,
    mid,
    near,
    glow,
    ridgeMesh,
    ridgeTex,
    topBranchMesh,
    topBranchTex,
    bottomBranchMesh,
    bottomBranchTex,
  };
};
```

- [ ] **Step 3: Dispose new forest resources on cleanup**

In the cleanup block, before `(scene.background as THREE.CanvasTexture).dispose();`, add (after the existing firefly disposes):

```tsx
forest.ridgeTex.dispose();
forest.ridgeMesh.geometry.dispose();
(forest.ridgeMesh.material as THREE.Material).dispose();
forest.topBranchTex.dispose();
forest.topBranchMesh.geometry.dispose();
(forest.topBranchMesh.material as THREE.Material).dispose();
forest.bottomBranchTex.dispose();
forest.bottomBranchMesh.geometry.dispose();
(forest.bottomBranchMesh.material as THREE.Material).dispose();
```

- [ ] **Step 4: Build + smoke check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Scroll down to the forest stage. You should see:
- Fireflies (unchanged)
- A horizon pine ridge along the top of the stage (visible as you enter from sky)
- Dark branches draping down from the top of the firefly field
- Dark branches rising up from the bottom

The fireflies should look "framed" rather than floating in open space. Kill dev server.

- [ ] **Step 5: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useThreeSceneMount.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): forest stage gains pine horizon + close branch frames

forestGroup now includes a horizon pine ridge at the top of the
stage (where the camera arrives from sky) and two alpha-textured
close-branch frames — one draping down from above, one rising up
from below — that frame the existing firefly field. Branch textures
are generated programmatically.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Underground stage content

Fill `undergroundGroup` with descending roots at the top, glowing fungi point sprites, 5 wriggling worms, and 3 slow-crawling beetles.

**Files:**
- Modify: `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`

- [ ] **Step 1: Add underground texture builders**

In `useThreeSceneMount.tsx`, near the other texture builders, add:

```tsx
// Warm-honey glow for fungi (lower intensity than fireflies).
const buildFungiGlowTexture = (): THREE.CanvasTexture => {
  return buildGlowTexture(
    "rgba(200, 150, 70, 0.95)",
    "rgba(160, 100, 40, 0.45)",
    "rgba(160, 100, 40, 0)"
  );
};

// Descending tree roots — alpha texture with branching root shapes hanging
// from the top edge into the soil.
const buildRootsTexture = (
  width: number = 1024,
  height: number = 512,
  rootCount: number = 7,
  fill: string = "#0a0805"
): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = fill;
  for (let i = 0; i < rootCount; i++) {
    const startX = (i / rootCount) * width + Math.random() * (width / rootCount);
    let x = startX;
    let y = 0;
    const segments = 12 + Math.floor(Math.random() * 6);
    const baseThickness = 6 + Math.random() * 8;
    for (let s = 0; s < segments; s++) {
      const dx = (Math.random() - 0.5) * 30;
      const dy = height / segments;
      const thickness = baseThickness * (1 - s / segments);
      ctx.beginPath();
      ctx.moveTo(x - thickness, y);
      ctx.lineTo(x + thickness, y);
      ctx.lineTo(x + dx + thickness * 0.6, y + dy);
      ctx.lineTo(x + dx - thickness * 0.6, y + dy);
      ctx.closePath();
      ctx.fill();
      x += dx;
      y += dy;
      // Occasional small side branch
      if (Math.random() < 0.18 && s > 1) {
        const sideDx = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 20);
        const sideThickness = thickness * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y - dy * 0.5);
        ctx.lineTo(x + sideDx, y - dy * 0.5 + 8);
        ctx.lineTo(x + sideDx, y - dy * 0.5 + 8 + sideThickness);
        ctx.lineTo(x, y - dy * 0.5 + sideThickness);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  return new THREE.CanvasTexture(c);
};

// Worm — soft pink-ish elongated curve.
const buildWormTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#9a5a4a";
  ctx.beginPath();
  ctx.moveTo(8, 32);
  ctx.quadraticCurveTo(64, 16, 128, 32);
  ctx.quadraticCurveTo(192, 48, 248, 32);
  ctx.lineTo(248, 38);
  ctx.quadraticCurveTo(192, 54, 128, 38);
  ctx.quadraticCurveTo(64, 22, 8, 38);
  ctx.closePath();
  ctx.fill();
  return new THREE.CanvasTexture(c);
};

// Beetle — small dark oval body.
const buildBeetleTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1a1208";
  ctx.beginPath();
  ctx.ellipse(32, 16, 22, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Slight highlight stripe
  ctx.fillStyle = "#2a1f10";
  ctx.beginPath();
  ctx.ellipse(32, 12, 20, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
};
```

- [ ] **Step 2: Extend `UndergroundStage` interface and `buildUndergroundGroup`**

Replace the existing `UndergroundStage` interface and `buildUndergroundGroup` function with:

```tsx
interface CreatureState {
  mesh: THREE.Mesh;
  speed: number;       // x-translation per frame
  startX: number;      // base x for the wiggle reference
  wiggleAmp: number;   // y-wiggle amplitude (0 for beetles)
  phase: number;       // sinusoidal phase offset
  baseY: number;       // base y position
}

interface UndergroundStage {
  group: THREE.Group;
  fungi: { points: THREE.Points; phases: Float32Array };
  fungiTex: THREE.CanvasTexture;
  rootsMesh: THREE.Mesh;
  rootsTex: THREE.CanvasTexture;
  worms: CreatureState[];
  wormTex: THREE.CanvasTexture;
  beetles: CreatureState[];
  beetleTex: THREE.CanvasTexture;
}

const FUNGI_COUNT = 30;
const WORM_COUNT = 5;
const BEETLE_COUNT = 3;

const buildUndergroundGroup = (): UndergroundStage => {
  const group = new THREE.Group();
  group.position.y = UNDERGROUND_CENTER_Y;

  // Descending roots at the top of the stage
  const rootsTex = buildRootsTexture();
  const rootsGeometry = new THREE.PlaneGeometry(SPREAD_X * 1.4, 40);
  const rootsMaterial = new THREE.MeshBasicMaterial({
    map: rootsTex,
    transparent: true,
    depthWrite: false,
  });
  const rootsMesh = new THREE.Mesh(rootsGeometry, rootsMaterial);
  rootsMesh.position.set(0, SPREAD_Y * 0.35, -10);
  group.add(rootsMesh);

  // Fungi point sprites — scattered through the soil region
  const fungiTex = buildFungiGlowTexture();
  const positions = new Float32Array(FUNGI_COUNT * 3);
  const fungiPhases = new Float32Array(FUNGI_COUNT);
  for (let i = 0; i < FUNGI_COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y * 0.7 - SPREAD_Y * 0.05;
    positions[i * 3 + 2] = -15 + Math.random() * 25;
    fungiPhases[i] = Math.random() * Math.PI * 2;
  }
  const fungiGeometry = new THREE.BufferGeometry();
  fungiGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const fungiMaterial = new THREE.PointsMaterial({
    size: 1.2,
    map: fungiTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const fungiPoints = new THREE.Points(fungiGeometry, fungiMaterial);
  group.add(fungiPoints);

  // Worms — five PlaneGeometry sprites with horizontal translation + y-wiggle
  const wormTex = buildWormTexture();
  const worms: CreatureState[] = [];
  for (let i = 0; i < WORM_COUNT; i++) {
    const geometry = new THREE.PlaneGeometry(8, 2);
    const material = new THREE.MeshBasicMaterial({
      map: wormTex,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const baseY =
      ((i + 1) / (WORM_COUNT + 1) - 0.5) * SPREAD_Y * 0.6 - SPREAD_Y * 0.1;
    const startX = (Math.random() - 0.5) * SPREAD_X;
    mesh.position.set(startX, baseY, 0);
    group.add(mesh);
    worms.push({
      mesh,
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.1),
      startX,
      wiggleAmp: 0.6,
      phase: Math.random() * Math.PI * 2,
      baseY,
    });
  }

  // Beetles — three slower planes, no wiggle
  const beetleTex = buildBeetleTexture();
  const beetles: CreatureState[] = [];
  for (let i = 0; i < BEETLE_COUNT; i++) {
    const geometry = new THREE.PlaneGeometry(3, 1.5);
    const material = new THREE.MeshBasicMaterial({
      map: beetleTex,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const baseY =
      ((i + 1) / (BEETLE_COUNT + 1) - 0.5) * SPREAD_Y * 0.5 + SPREAD_Y * 0.1;
    const startX = (Math.random() - 0.5) * SPREAD_X;
    mesh.position.set(startX, baseY, 2);
    group.add(mesh);
    beetles.push({
      mesh,
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.04),
      startX,
      wiggleAmp: 0,
      phase: 0,
      baseY,
    });
  }

  return {
    group,
    fungi: { points: fungiPoints, phases: fungiPhases },
    fungiTex,
    rootsMesh,
    rootsTex,
    worms,
    wormTex,
    beetles,
    beetleTex,
  };
};
```

- [ ] **Step 3: Animate underground creatures and fungi twinkle**

Update the `animate` function to update fungi and creatures each frame. Inside the existing `animate` function, before `applyScrollAndMouse()`, add:

```tsx
// Fungi twinkle — same average-opacity trick as stars
const fungiMat = underground.fungi.points.material as THREE.PointsMaterial;
fungiMat.opacity = 0.7 + 0.2 * Math.sin(frame * 0.025);
fungiMat.transparent = true;
fungiMat.needsUpdate = true;

// Worms — x-translate and y-wiggle; wrap horizontally at the spread edges
for (const w of underground.worms) {
  w.mesh.position.x += w.speed;
  if (w.mesh.position.x > SPREAD_X * 0.6) w.mesh.position.x = -SPREAD_X * 0.6;
  if (w.mesh.position.x < -SPREAD_X * 0.6) w.mesh.position.x = SPREAD_X * 0.6;
  w.mesh.position.y =
    w.baseY + Math.sin(frame * 0.05 + w.phase) * w.wiggleAmp;
}

// Beetles — x-translate only
for (const b of underground.beetles) {
  b.mesh.position.x += b.speed;
  if (b.mesh.position.x > SPREAD_X * 0.6) b.mesh.position.x = -SPREAD_X * 0.6;
  if (b.mesh.position.x < -SPREAD_X * 0.6) b.mesh.position.x = SPREAD_X * 0.6;
}
```

- [ ] **Step 4: Dispose underground resources on cleanup**

In the cleanup block, before `(scene.background as THREE.CanvasTexture).dispose();`, add (after the forest disposes from Task 7):

```tsx
underground.fungiTex.dispose();
underground.fungi.points.geometry.dispose();
(underground.fungi.points.material as THREE.Material).dispose();
underground.rootsTex.dispose();
underground.rootsMesh.geometry.dispose();
(underground.rootsMesh.material as THREE.Material).dispose();
underground.wormTex.dispose();
for (const w of underground.worms) {
  w.mesh.geometry.dispose();
  (w.mesh.material as THREE.Material).dispose();
}
underground.beetleTex.dispose();
for (const b of underground.beetles) {
  b.mesh.geometry.dispose();
  (b.mesh.material as THREE.Material).dispose();
}
```

- [ ] **Step 5: Build + smoke check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Scroll all the way to the bottom (Contact stage). You should see:
- Dark tree roots descending from the top of the stage
- ~30 small warm-glowing fungi scattered through the soil region
- 5 worms wriggling slowly horizontally across the stage
- 3 beetles slowly crawling

The Contact block UI sits over all of this. Kill dev server.

- [ ] **Step 6: Commit**

```bash
cd /workspace && git add portfolio-website/src/utils/hooks/useThreeSceneMount.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): populate underground stage with roots, fungi, creatures

undergroundGroup gains descending tree roots along the top of the
stage, 30 glowing-fungi point sprites scattered through the soil,
5 wriggling worms (slow x-translate + sinusoidal y-wiggle), and
3 slow-crawling beetles (x-translate only). All textures generated
programmatically. Creatures wrap horizontally at spread edges so
they continuously cross the field.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Final verification

End-to-end check across the entire branch.

**Files:**
- None modified (verification only)

- [ ] **Step 1: Full build + lint + test**

```bash
cd portfolio-website && npm run build && npm run lint && npm test
```

Expected:
- Build passes
- Lint shows only pre-existing errors from earlier orchard-retheme work (no new errors from this plan's files)
- Tests pass: existing 18 + 20 new from `useStageScroll.test.ts` = 38 tests across 4 test files

- [ ] **Step 2: Manual walkthrough**

```bash
cd portfolio-website && npm run dev
```

Open the homepage. Walk through all four parallax pages:

- **Welcome (top, scroll ≈ 0)**: deep midnight-blue background, stars twinkling, crescent moon upper-left, faint pine ridge peeking from below. Crickets faint (~25% volume). Vignette has midnight-blue tint.
- **About (scroll ≈ 1)**: still mostly sky, pine ridge more visible near bottom.
- **Sky→Forest blend (scroll ≈ 1.5–1.8)**: ridge transitions, crickets ramp up, vignette tint shifts from blue toward bark.
- **Featured Work (scroll ≈ 2)**: full forest stage — horizon pine ridge along top, close branches framing the firefly field at top and bottom, fireflies still depth-parallax + mouse-react. Crickets at full volume. Vignette bark-brown.
- **Forest→Underground blend (scroll ≈ 2.2–2.5)**: branches scroll up, roots come into view from top, crickets ramp down.
- **Contact (scroll ≈ 3)**: descending roots, fungi twinkling, worms wriggling across, beetles crawling slowly. Crickets faint again. Vignette deep umber.

Other checks:
- Toggle audio mute on/off — confirm scroll volume modulation pauses while muted, resumes correctly.
- Move mouse around in the forest stage — fireflies should still nudge (mouse parallax preserved).
- Resize browser — three.js renderer resizes; scene re-renders correctly.
- macOS: System Settings → Accessibility → Display → "Reduce motion" ON. Reload. Confirm animations stop but scroll-based stage translation still works.

Kill dev server.

- [ ] **Step 3: Final status check**

```bash
cd /workspace && git status
git log --oneline feat/portfolio-nature-retheme ^main | head -25
```

Expected:
- Working tree clean (only `.claude/settings.local.json` and `crickets.wav` untracked, both intentional)
- New commits on top of the orchard-retheme baseline: 1 spec (`cd9cd3d`) + 1 plan + 8 implementation commits (Tasks 1–8). Task 9 has no commit (verification only).

The implementing agent should pause and ask the user whether to push the branch / open a PR, or stay local for further iteration.
