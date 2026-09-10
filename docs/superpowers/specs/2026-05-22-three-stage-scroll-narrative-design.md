# Three-Stage Scroll Narrative — Design

**Date:** 2026-05-22
**Status:** Draft, pending user review
**Scope:** Extend the existing single-scene firefly background into a three-stage spatial descent — night sky → forest → underground — that the camera traverses as the user scrolls. Adds a stage-tinted vignette overlay and scroll-modulated audio volume. The four foreground content blocks (Welcome, About, FeaturedWork, Contact) are unchanged.

## Context

The current homepage scene is a single stratified firefly field with three z-depth point layers, driven by `useThreeSceneMount` and scroll parallax. The visual narrative is flat: same orchard mood from top to bottom. The user wants a vertical journey instead — start in the night sky (where Welcome + About live), descend into the lit forest with pines framing the firefly field (Featured Work), and continue below the soil line where worms, beetles, descending roots, and glowing fungi inhabit the Contact stage.

This design keeps the existing `@react-spring/parallax` page mechanics and the foreground content layer untouched. All changes happen in the background canvas (the three.js scene), one new DOM overlay (vignette), and the audio-volume curve.

## Goals

- Replace the single firefly stage with three stratified stages: sky, forest, underground.
- Camera-pan-down feel via per-stage `THREE.Group` translation tied to `scrollRef` (existing pattern extended).
- Add stage-tinted vignette around the viewport edges.
- Modulate ambient audio volume by stage (25% sky / 100% forest / 25% underground).
- Preserve the existing depth-parallax within the forest stage (the near/mid/far firefly layers).
- Programmatic textures only (canvas → `CanvasTexture`); no new image assets.

## Non-goals

- No changes to the four foreground content blocks (Welcome, About, FeaturedWork, Contact) or their frosted-glass styling.
- No changes to `@react-spring/parallax` configuration. Pages stay at 4. Block offsets in `headerToPageMap` stay.
- No changes to project pages, Header chrome, or the audio toggle UX (cricket emoji + animated arrow hint).
- No new audio assets — `crickets.wav` continues to play, just volume-modulated.
- No changes to mouse parallax behavior beyond keeping it active within the forest stage's firefly layers.
- No new image assets — all alpha textures (stars, moon, pine ridges, branches, roots, fungi, worm, beetle sprites) are generated programmatically.

## Architecture

`useThreeSceneMount.tsx` is refactored from a single firefly scene into a three-stage stratified scene. Each stage gets a top-level `THREE.Group` whose `position.y` is driven by `scrollRef`:

```
scene
├── skyGroup            (translate y by scroll * stage1Multiplier)
│   ├── star field        (THREE.Points, white-blue glow texture)
│   ├── moon mesh         (PlaneGeometry, alpha texture)
│   └── distant pine ridge (PlaneGeometry, alpha texture, bottom of group)
├── forestGroup         (translate y by scroll * stage2Multiplier)
│   ├── far/mid/near firefly Points (existing, preserved)
│   ├── pine horizon ridge (PlaneGeometry, alpha texture, top of group)
│   └── close branch frames (PlaneGeometry, alpha texture, top + bottom)
└── undergroundGroup    (translate y by scroll * stage3Multiplier)
    ├── descending roots  (PlaneGeometry, alpha texture, top of group)
    ├── fungi field       (THREE.Points, warm-glow texture)
    ├── worm sprites      (5-6 PlaneGeometry, slow x-translate + y-wiggle)
    └── beetle sprites    (3-4 PlaneGeometry, slow x-translate)
```

Background is rebuilt as a single tall vertical gradient texture (sky → forest → underground stops) applied to `scene.background`. As stage groups translate against `scrollRef`, the camera "sees" different vertical slices.

Outside the canvas: a new fixed-position `<div>` vignette overlay rendered in `InfiniteScrollContainer` between the canvas (z-index 0) and the parallax content layer (z-index 1). Its tint is driven by a scroll-derived stage color from the shared `useStageScroll` helper.

For readability, `useThreeSceneMount.tsx` decomposes its internals into separate builder functions (`buildSkyGroup`, `buildForestGroup`, `buildUndergroundGroup`, `buildBackgroundTexture`, plus per-element texture builders). The file stays single-responsibility (3D scene mount) but its internals are factored for clarity.

## Stage definitions

### Stage 1 — Sky (scroll `0 → ~1.5`, covers Welcome + About)

| Element | Spec |
|---|---|
| Background tint | Deep midnight blue `#0a0e1f` at top → cool blue-purple `#1a1f3a` at bottom |
| Stars | 150 white-blue point sprites, subtle alpha-sinusoidal twinkle, no translation. Scattered across the stage's vertical span. |
| Moon | Single crescent, warm cream `#f0e2b8`, upper-left corner. `PlaneGeometry` with alpha texture. Stationary within group. |
| Distant pine ridge | Dark silhouette `#0a0a08`, alpha-textured plane, positioned at the bottom edge of `skyGroup` so it peeks into frame as the camera approaches the forest boundary. |

### Stage 2 — Forest (scroll `~1.5 → ~2.5`, covers Featured Work)

| Element | Spec |
|---|---|
| Background tint | Deep bark `#1a1410` → moss `#2a3a22` → fern `#3a4a2c` (vertical gradient within stage) |
| Fireflies | Existing 80 far / 50 mid / 25 near point sprites with depth parallax. Preserved as-is, including mouse-parallax X offsets. |
| Horizon pine ridge | Dark silhouette, alpha-textured plane, top of `forestGroup` (where the camera arrives from sky). Stationary within group. |
| Close framing branches | Two alpha-textured planes — one at the top (close branches drape down) and one at the bottom (close trunks/branches rise up) of `forestGroup`. Frame the firefly field. |

### Stage 3 — Underground (scroll `~2.5 → end`, covers Contact)

| Element | Spec |
|---|---|
| Background tint | Dark moss `#1a2418` at top → umber-brown `#2a1f10` → deep earth `#0e0905` at bottom |
| Descending roots | Tree-root silhouette alpha-textured plane at the top of `undergroundGroup` (the camera arrives into them from forest). Roots branch downward from the top edge. |
| Glowing fungi | 30 small warm-honey point sprites, lower intensity than fireflies, subtle twinkle. Scattered through the soil region. |
| Worms | 5 alpha-textured PlaneGeometry. Slow horizontal translation (different speeds + directions per worm) with small sinusoidal y-wiggle to simulate wriggling. |
| Beetles | 3 alpha-textured PlaneGeometry. Slow horizontal translation, no wiggle. Slightly different size/color from worms. |

### Boundary blend zones

Stage boundaries are blend zones, not hard cutoffs. The audio-modulation table below defines the source-of-truth boundaries:

- Sky → Forest transition: `scroll` in `[1.5, 1.8]` (0.3-wide blend zone)
- Forest → Underground transition: `scroll` in `[2.2, 2.5]` (0.3-wide blend zone)

Inside a blend zone, the background gradient transitions naturally (the camera "sees" the gradient region between two stage tints), the foreground stage elements transition because their stage groups physically translate off-frame, the audio volume linearly ramps between the two stages' levels, and the vignette color linearly interpolates RGB channels between the two stages' tints.

## Audio modulation

`useAmbientSound` gains a `setVolume(multiplier: number)` method that mutates `audio.volume` directly (no state, no effect re-run, so it won't accidentally re-call `play()` on every scroll tick).

`Header.tsx` reads the `volumeMultiplier` from `useStageScroll` and calls `setVolume(multiplier)` whenever it changes.

Curve (multiplier as a function of `scroll`):

| Scroll range | Multiplier | Stage |
|---|---|---|
| `0 → 1.5` | `0.25` (constant) | Sky |
| `1.5 → 1.8` | `0.25 → 1.0` (linear ramp) | Sky→Forest blend |
| `1.8 → 2.2` | `1.0` (constant) | Forest core |
| `2.2 → 2.5` | `1.0 → 0.25` (linear ramp) | Forest→Underground blend |
| `2.5 → ∞` | `0.25` (constant) | Underground |

Final `audio.volume = baseVolume * multiplier`. Base volume stays `0.1` from `Header.tsx`.

Mute toggle behavior unchanged — clicking the 🦗 button toggles `paused`. When paused, the scroll multiplier is irrelevant. When unpaused, the scroll-driven multiplier resumes.

## Vignette

New component: `src/components/home/SceneVignette.tsx`. Rendered inside `InfiniteScrollContainer`, between the canvas (z-index 0) and the parallax content layer (z-index 1). `pointer-events: none`.

Shape — a radial gradient transparent in the center, fading to the stage tint at the edges:

```css
background: radial-gradient(
  ellipse 75% 55% at center,
  transparent 30%,
  var(--vignette-color) 100%
);
```

Stage tints (at alpha 0.85):

| Stage | RGB | Hex |
|---|---|---|
| Sky | `rgba(10, 14, 31, 0.85)` | `#0a0e1f` |
| Forest | `rgba(26, 20, 16, 0.85)` | `#1a1410` |
| Underground | `rgba(14, 9, 5, 0.85)` | `#0e0905` |

Color interpolation across boundaries: in a blend zone, RGB channels are linearly mixed between the two stage tints based on scroll position. The shared `useStageScroll` helper returns the interpolated CSS color string as `vignetteColor`.

The component sets `style={{ '--vignette-color': vignetteColor }}` on the overlay `<div>`; the CSS uses `var(--vignette-color)`.

## Shared helper: `useStageScroll`

New file: `src/utils/hooks/useStageScroll.ts`. Pure helper (not a React hook in the strict sense — exports a pure function that any consumer can call from inside an effect or render).

```ts
type Stage = "sky" | "forest" | "underground";

interface StageScrollResult {
  stage: Stage;             // current dominant stage
  blendOut: number;         // 0..1 — how much of current stage has scrolled out
  blendIn: number;          // 0..1 — how much of next stage has scrolled in
  volumeMultiplier: number; // 0.25..1.0
  vignetteColor: string;    // "rgba(r, g, b, 0.85)"
}

export const STAGE_BOUNDARIES = {
  skyToForest: 1.5,
  forestCore: 1.8,
  forestExit: 2.2,
  forestToUnderground: 2.5,
};

export const computeStageScroll(scroll: number): StageScrollResult;
```

The function is pure — `scroll` in, `StageScrollResult` out. No closures, no React state, no side effects. Unit-testable in isolation.

In `Header.tsx`, this gets called per render (cheap pure function), or wired via a small ref/effect pattern that calls it on `scrollRef.current` changes — same scroll source the three.js loop reads.

In `SceneVignette.tsx`, same pattern — read scroll, compute color, apply.

In `useThreeSceneMount.tsx`, the three.js animation loop calls it per frame to derive stage-translation values for each group (and could also derive other stage-aware visuals if needed).

## Affected files

### New

- `src/utils/hooks/useStageScroll.ts` — pure helper + boundary constants.
- `src/utils/hooks/useStageScroll.test.ts` — vitest tests (node env, no DOM needed).
- `src/components/home/SceneVignette.tsx` — fixed `<div>` overlay component.

### Modified

- `src/utils/hooks/useThreeSceneMount.tsx` — refactor to three-stage stratified scene. Decompose internals into per-stage `build*Group` functions. Add programmatic alpha textures for moon, pine ridges, branches, roots, fungi, worms, beetles. Rebuild background as single tall vertical gradient. Stage groups translate against `scrollRef`. Preserve existing reduced-motion handling and resource cleanup.
- `src/utils/hooks/useAmbientSound.tsx` — add a `setVolume(multiplier: number)` method on the returned object. Mutates `audio.volume` directly without triggering effect re-run.
- `src/components/home/Header.tsx` — call `setVolume` from a scroll-driven effect (reading `scrollRef` from `InfiniteScrollContainer` plumbing or via a new prop). Multiplier comes from `computeStageScroll(scroll).volumeMultiplier`. Audio toggle UX unchanged.
- `src/components/home/InfiniteScrollContainer.tsx` — render `<SceneVignette scrollRef={scrollRef} />` between the canvas and the parallax content layer. `scrollRef` is the existing ref-mirror of `useParallaxScroll`.
- `src/pages/HomePage.tsx` — lift the `useParallaxScroll` + `scrollRef` mirror out of `InfiniteScrollContainer` and into `HomePage`, then pass `scrollRef` as a prop to both `<Header />` and `<InfiniteScrollContainer />`. This is the cleanest way to give `Header` access to scroll for audio-volume modulation without introducing context or redux for a per-frame value. `useParallaxScroll`'s `document.querySelector(".parallax")` lookup still works because the parallax element is mounted as a descendant of `HomePage`.

### Removed

None.

## Reduced-motion handling

The current `useThreeSceneMount` honors `prefers-reduced-motion: reduce` by rendering one static frame and skipping the rAF loop. Preserve this. In reduced-motion mode:

- The three-stage scene still renders, but stage groups only update their `position.y` when `scrollRef` changes (driven by scroll events, not by rAF). Effectively, no per-frame animation but stages still respond to scroll — a static photograph at each scroll position.
- The fungi twinkle, star twinkle, worm wiggle, and beetle translation all skip per-frame updates.
- Vignette color updates respond to scroll (CSS-only, no animation loop involved).
- Audio volume updates respond to scroll (no animation loop involved).

## Verification

Before declaring complete:

1. `npm run build` — TypeScript compile passes.
2. `npm run lint` — no new lint errors.
3. `npm test` — all tests pass, including new `useStageScroll.test.ts` cases.
4. `npm run dev` — manual walkthrough:
   - Scroll from top to bottom slowly. Confirm:
     - Sky stage shows stars + moon + distant pine ridge peeking near the bottom.
     - Forest stage shows fireflies framed by close branches at top/bottom + horizon pine ridge.
     - Underground stage shows descending roots + crawling worms/beetles + glowing fungi.
     - Background gradient smoothly transitions across stages.
     - Vignette edges shift tint between stages.
     - Crickets volume swells at the forest stage and softens at the edges.
   - Toggle audio mute — confirm scroll volume modulation pauses while muted, resumes correctly on unmute.
   - Verify mouse parallax still nudges fireflies in the forest stage.
   - Resize browser — scene resizes correctly.
   - Toggle OS-level reduced-motion preference — confirm animations stop but stage transitions still happen on scroll.
5. Boundary-case scroll tests for `useStageScroll`:
   - scroll = 0, 1.5, 1.65 (mid-blend), 1.8, 2.0, 2.2, 2.5, 3.0 — verify expected `stage`, `volumeMultiplier`, and `vignetteColor`.

## Out of scope (deferred)

- Mouse parallax extension to sky (slight star drift) or underground (slight bug drift) — could be a polish follow-up.
- Stage transition audio cues (e.g. a gust of wind at sky→forest) — would need new audio assets.
- Configurable stage boundaries (currently hard-coded constants). Could be exposed if the user wants to tune the boundaries by eye.
- Project pages and any non-homepage surfaces.
