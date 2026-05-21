# Portfolio Nature Retheme — Design

**Date:** 2026-05-21
**Status:** Draft, pending user review
**Scope:** Replace the portfolio's current sci-fi / "space" identity (rotating Earth + 200-star three.js scene, space-arp ambient audio, neutral-grey palette) with a coherent forest / orchard identity. Visual language only — no IA, routing, or feature changes.

## Context

The site's current homepage scene is a three.js Earth rotating against a 200-star field on `space.jpeg`, with a `space-arp-f-chords.wav` ambient loop. Its palette is a generic dark neutral system (`#242424`, `neutral-100/300/400/900`, `bg-black/30` frosted cards). But the *copy* in the About block already positions the author as "a designer, developer, and nature enthusiast building tools that connect people to plants," and references mountain biking and an orchard. The visual identity competes with the written identity.

This retheme resolves that conflict by flipping the entire visual system to a warm orchard / forest aesthetic, with green leading the structural palette and honey-gold as the primary accent. The 3D scene is rewritten to match — drifting fireflies and apple blossom petals at three depth layers, with both scroll-tied and mouse-tied parallax.

## Goals

- Replace the "space" identity end-to-end: palette + typography + 3D scene + ambient audio.
- Establish a small, reusable token system (`--orchard-*` CSS variables) so future components have a single source of truth.
- Preserve the existing layout, routing, parallax structure, and interaction patterns. This is a retheme, not a redesign.
- Keep the homepage atmospheric/dark; keep the inner project pages dark and consistent (no separate "paper" reading mode).
- Keep the existing `@react-spring/parallax` foreground scroll structure intact; add background-scene depth parallax + mouse parallax on top.

## Non-goals

- No layout changes, no IA changes, no copy rewrites (except one optional H1 nudge and an emoji swap on the audio toggle).
- No theming of microfrontend remotes (`calculators`, `picture-to-pixel-art`) or embedded iframes (`yarden.diy`, etc.) — those are separately deployed and own their own styling.
- No theming of the calculator submodule pages beyond the host shell.
- No move to Tailwind theme config / custom plugin — tokens live in plain CSS variables and are referenced via Tailwind arbitrary-value classes (`bg-[var(--orchard-bark)]`).
- No light theme, no automatic theme switching, no `prefers-color-scheme: light` branch.

## Design system

### Palette tokens

Defined once in `src/index.css` on `:root`. Replace all hard-coded `neutral-*`, `bg-black/30`, `bg-white`, `text-blue-400`, `#242424` usages.

| Token | Hex | Role |
|---|---|---|
| `--orchard-bark` | `#1f2a1f` | Page background, fixed canvas, base surfaces |
| `--orchard-moss` | `#3a4a2c` | Raised surfaces, cards, divider tones |
| `--orchard-fern` | `#6b7a45` | Secondary accent, hover states, borders |
| `--orchard-honey` | `#d8a850` | Primary accent — links, active nav, CTA fill |
| `--orchard-amber` | `#c8804a` | Warm secondary accent — featured-work hover overlays |
| `--orchard-cream` | `#e8d8a8` | Headings, high-contrast text |

`color-scheme: dark` stays. Body background becomes `var(--orchard-bark)`.

### Typography

Two faces, loaded via Google Fonts `<link>` in `index.html` (avoids adding a Vite plugin or `@fontsource` deps):

- **Display — Fraunces** (modern-vintage variable serif). `font-weight: 600` for h1, `font-weight: 500` for h2/h3. Enable `font-variation-settings: "opsz" 144` for display sizes.
- **Body — Lato**. `font-weight: 400` regular, `font-weight: 700` bold.

Update `:root` font stack in `src/index.css`:

```css
:root {
  font-family: "Lato", system-ui, sans-serif;
}
h1, h2, h3, .display { font-family: "Fraunces", Georgia, serif; }
```

### Surface treatment

The current frosted-glass pattern (`bg-black/30 backdrop-blur-lg`) is retained but warm-tinted:

```
bg-[var(--orchard-bark)]/45 backdrop-blur-lg border border-[var(--orchard-honey)]/15 rounded-3xl
```

The translucent dark over the lit 3D scene reads as "in a warm space at dusk" rather than "floating glass on black."

### Texture

A thin film-grain overlay applied as a fixed pseudo-element on `<body>`:

```css
body::after {
  content: "";
  position: fixed; inset: 0; pointer-events: none; z-index: 100;
  opacity: 0.18;
  background-image:
    radial-gradient(rgba(248,226,176,0.10) 0.8px, transparent 0.8px),
    radial-gradient(rgba(20,30,15,0.18) 0.8px, transparent 0.8px);
  background-size: 3px 3px, 4px 4px;
  background-position: 0 0, 1px 2px;
}
```

## Three.js scene rewrite

Full rewrite of `src/utils/hooks/useThreeSceneMount.tsx`.

### Removed

- `Earth` mesh (and its scroll-driven rotation in `useScrollListen`)
- 200 white `SphereGeometry` stars
- `space.jpeg` background texture
- `OrbitControls` — the homepage background should not be user-draggable
- `ambientLight` and `pointLight` — both are redundant once the lit Earth mesh is gone. Fireflies use `PointsMaterial` (unlit) and petals use `MeshBasicMaterial` (unlit).
- `PointLightHelper` (debug-only)

### Added

**Background.** Programmatic radial gradient texture (bark → moss), painted into an off-screen canvas at scene init and assigned to `scene.background`. No external image dependency.

**Three firefly layers** using `THREE.Points` with a `PointsMaterial({ map: glowSprite, transparent: true, depthWrite: false, blending: AdditiveBlending })`. The glow sprite is generated programmatically (radial gradient canvas → `CanvasTexture`).

| Layer | Count | Size | z | Drift speed |
|---|---|---|---|---|
| Far | ~80 | 2–3 px | -40 | slow |
| Mid | ~50 | 4–5 px | -10 | medium |
| Near | ~25 | 6–8 px | +10 | fast |

Each layer is its own `THREE.Group`. Per-frame, every firefly gets a small sinusoidal offset (random per-particle phase) so the field looks alive even when scroll and mouse are still.

**Apple blossom petals.** ~20 `PlaneGeometry` planes with a small apple-blossom alpha texture (generated programmatically: soft elliptical gradient with a hint of pink, transparent edges). Each petal slowly translates downward with a small per-petal rotation rate; when one falls below the bottom of the visible region, it wraps to the top with a fresh random x.

**Scroll-tied depth parallax (P1).** Each layer group's `position.y` is offset against the parallax scroll value, with progressively smaller multipliers for far→near (e.g. far × 0.15, mid × 0.45, near × 1.0). On scroll, near layer translates ~6× more than far layer — yielding the depth parallax read.

**Mouse-tied parallax (P4).** New hook `src/utils/hooks/useMouseParallax.tsx`. Listens to `window` `mousemove`, normalizes to `{ x: -0.5..0.5, y: -0.5..0.5 }`, exposes a `useRef`-backed value (not React state — avoids per-frame re-renders). In the animation loop, this offset is lerped toward the current mouse position and applied to all layer groups' `position.x` and `position.y` as a small additional offset (e.g. ±2 units for near, ±0.5 for far). Effect: scene gently "looks toward" the cursor.

**Animation loop.** Single `requestAnimationFrame` driving: per-particle sinusoidal idle drift; per-petal fall + rotate + wrap; scroll-position pull on each group; mouse-offset lerp.

**Cleanup.** Window `resize` listener removal, `cancelAnimationFrame`, renderer/geometry/material dispose.

### Modified

- `src/utils/hooks/useScrollListen.tsx`: replace the earth-pose update with a setter for the three group offsets. Currently exposes `earth` — replace with a `scrollOffsetRef` consumed by `useThreeSceneMount`.
- `src/components/home/InfiniteScrollContainer.tsx`: drop `THREE` import and earth-related plumbing; pass the scroll ref through to `useThreeSceneMount` instead.

## Audio

- Delete `public/assets/space-arp-f-chords.wav`.
- Add `public/assets/crickets-dusk.ogg` — sourced from freesound.org (CC0 or CC-BY). Must loop seamlessly; expected length 20–40 s.
- Update `src/components/home/Header.tsx`:
  - `useAmbientSound("/assets/crickets-dusk.ogg", 0.1)` — keep gain at 0.1, keep default-paused behavior.
  - Toggle emoji: muted → `🔇`, playing → `🦗`. (Small editorial nod; trivial revert if disliked.)

## Affected files

### New

- `src/utils/hooks/useMouseParallax.tsx`
- `public/assets/crickets-dusk.ogg`

### Modified

- `index.html` — add Fraunces + Lato `<link>` to Google Fonts.
- `src/index.css` — add `--orchard-*` tokens, body background, font stack, grain overlay, color-scheme retained.
- `src/App.css` — strip logo/spin styles; keep only root padding.
- `src/utils/hooks/useThreeSceneMount.tsx` — full rewrite (above).
- `src/utils/hooks/useScrollListen.tsx` — expose `scrollOffsetRef` instead of `earth`.
- `src/components/home/InfiniteScrollContainer.tsx` — drop earth wiring.
- `src/components/home/Header.tsx` — token + font swap; audio path + emoji.
- `src/components/home/WelcomeBlock.tsx` — token + font swap.
- `src/components/home/AboutMeBlock.tsx` — token + font swap; profile photo border `var(--orchard-cream)/30`.
- `src/components/home/FeaturedWorkBlock.tsx` — token + font swap; hover overlay uses `--orchard-amber`; "View all projects →" link uses `--orchard-honey`.
- `src/components/home/ContactBlock.tsx` — token swap; CTA `bg-[var(--orchard-honey)] text-[var(--orchard-bark)]` (replaces `bg-white text-black`).
- `src/components/home/ProfessionalGoalsBlock.tsx` — token + font swap. Currently commented out in the router, but include in the mechanical sweep since the changes are token-only.
- `src/pages/ProjectsIndexPage.tsx` — token swap; `text-blue-400` → `text-[var(--orchard-honey)]`; border + bg use `--orchard-moss` / `--orchard-fern`.
- `src/pages/ProjectPageTemplate.tsx` — token + font swap; back-button hover → `--orchard-honey`.
- `src/pages/projectPages/*.tsx` (12 files) — audit + replace neutral palette references. Most use the same `text-neutral-*` / `bg-neutral-*` family and will fall to the token swap mechanically. Bespoke colors per project page (if any) stay.

### Removed

- `public/assets/space.jpeg`
- `public/assets/space-arp-f-chords.wav`

## Copy nods

- Welcome H1 stays `"Welcome to My Portfolio"` by default. Optional alt copy `"Welcome to my orchard"` documented but not applied without user direction.
- About / Contact copy unchanged — already nature-aligned.
- No other space-themed strings exist in the codebase (audited during brainstorming).

## Verification

Before declaring complete:

1. `npm run build` — TypeScript compile passes.
2. `npm run lint` — no new lint errors.
3. `npm test` — vitest suite passes.
4. `npm run dev` — manual walkthrough:
   - Homepage: scroll Welcome → About → Featured Work → Contact end to end. Confirm depth parallax (near fireflies travel further per scroll-step than far), confirm petals drift down, confirm mouse moves nudge the field.
   - Header: click each tab, confirm active state in honey; click audio toggle, confirm crickets loop plays and emoji updates.
   - Featured Work: hover each tile, confirm warm-tinted expand still works.
   - Project pages: click each of the 12 project pages, confirm no white-on-white, no blue accents, no remaining `bg-neutral-900`.
   - Resize browser, confirm three.js renderer resizes correctly.
   - Mobile width (<768 px): confirm layout doesn't break.

## Out of scope

- Microfrontend remotes (`calculators`, `picture-to-pixel-art`) — separately deployed, own theming.
- Embedded iframe projects (Yarden, VoiceGarden host pages) — own styling.
- IA / navigation / routing changes.
- Performance optimization beyond what's already inherent in dropping the Earth mesh + 200 stars.
- Accessibility audit beyond preserving existing semantics (already done for `aria-description` on parallax layers, etc.).
