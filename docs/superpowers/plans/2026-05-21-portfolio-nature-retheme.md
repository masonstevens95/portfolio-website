# Portfolio Nature Retheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portfolio's sci-fi "space" identity (Earth + stars three.js scene, space-arp audio, neutral palette) with a coherent orchard/forest identity — green-led palette with honey-gold accent, Fraunces + Lato typography, drifting-firefly three.js scene with depth + mouse parallax, crickets ambient audio. Visual language only.

**Architecture:** Establish CSS-variable palette tokens (`--orchard-*`) in `src/index.css` as the single source of truth, then sweep usages of `neutral-*`, `bg-black/30`, `text-blue-400`, etc. across the home blocks, project shell, and project pages. Rewrite `useThreeSceneMount` to render three z-layered firefly point-fields plus drifting petals, with scroll-tied depth parallax and a new `useMouseParallax` hook for cursor-reactive drift. Keep `@react-spring/parallax` foreground scroll structure untouched.

**Tech Stack:** React 19, Vite 7, Tailwind 4 (arbitrary-value classes referencing CSS vars), three.js 0.178, `@react-spring/parallax`, Vitest (node env), Google Fonts (Fraunces + Lato via `<link>`).

**Spec:** `docs/superpowers/specs/2026-05-21-portfolio-nature-retheme-design.md` (committed `3a7c5d2`).

**Branch:** `feat/portfolio-nature-retheme` (already checked out).

**Note about TDD:** Most of this work is visual retheming where vitest tests don't validate "looks orchard-themed." TDD is applied to the one piece that's genuinely unit-testable: the pure normalization function inside `useMouseParallax`. The three.js scene rewrite and CSS token swaps are verified via `npm run build`, `npm run lint`, `npm test`, and a manual browser walkthrough.

**Note about coupling in Task 2:** The 3D scene rewrite touches four files (`useMouseParallax`, `useScrollListen`, `useThreeSceneMount`, `InfiniteScrollContainer`) as one coherent unit. Editing them separately leaves intermediate type errors; that's expected. Don't commit until all four are in place and `npm run build` is clean.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `portfolio-website/index.html` | Modify | Add Google Fonts `<link>` tags for Fraunces + Lato. |
| `portfolio-website/src/index.css` | Modify | Define `--orchard-*` CSS variables on `:root`. Apply body background, body grain overlay, and global font stacks. |
| `portfolio-website/src/App.css` | Modify | Strip Vite default logo/spin styles; keep only `#root` container. |
| `portfolio-website/src/utils/hooks/useMouseParallax.tsx` | Create | Tracks mouse position via `window mousemove`; exposes a `useRef` with normalized `{x, y}` offsets in `-0.5..0.5`. Pure normalization helper exported for unit test. |
| `portfolio-website/src/utils/hooks/useMouseParallax.test.ts` | Create | Vitest unit tests for `normalizeMousePosition` (node env). |
| `portfolio-website/src/utils/hooks/useScrollListen.tsx` | Modify | Strip earth-related code. Keep scroll-spy + redux dispatch only. Return `void`. |
| `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx` | Modify | Full rewrite. Programmatic bark→moss gradient background; three z-layered firefly point fields; drifting apple-blossom petal planes; per-layer scroll parallax + mouse parallax; cleanup. |
| `portfolio-website/src/components/home/InfiniteScrollContainer.tsx` | Modify | Drop `THREE` import. Convert `useParallaxScroll` value to a ref. Call `useScrollListen` for scroll-spy. Call `useMouseParallax` and pass refs into `useThreeSceneMount`. |
| `portfolio-website/public/assets/crickets-dusk.ogg` | Create | Seamlessly-looping crickets-at-dusk ambient audio loop (user-sourced from freesound.org). |
| `portfolio-website/src/components/home/Header.tsx` | Modify | Token + font swap. Audio path → `/assets/crickets-dusk.ogg`. Toggle emoji: muted `🔇`, playing `🦗`. |
| `portfolio-website/src/components/home/WelcomeBlock.tsx` | Modify | Token + font swap. |
| `portfolio-website/src/components/home/AboutMeBlock.tsx` | Modify | Token + font swap; profile photo border → cream/30. |
| `portfolio-website/src/components/home/FeaturedWorkBlock.tsx` | Modify | Token + font swap; hover gradient overlay → bark + amber; "View all projects →" link → honey. |
| `portfolio-website/src/components/home/ContactBlock.tsx` | Modify | Token + font swap; CTA `bg-[var(--orchard-honey)] text-[var(--orchard-bark)]`. |
| `portfolio-website/src/components/home/ProfessionalGoalsBlock.tsx` | Modify | Token + font swap (commented out in router; include for completeness). |
| `portfolio-website/src/pages/ProjectsIndexPage.tsx` | Modify | Token swap; `text-blue-400` → `text-[var(--orchard-honey)]`. |
| `portfolio-website/src/pages/ProjectPageTemplate.tsx` | Modify | Token + font swap; back-button hover → honey. |
| `portfolio-website/src/pages/projectPages/*.tsx` (11 files) | Modify | Mechanical palette-class swap per mapping table. |
| `portfolio-website/src/pages/projectPages/calculators/{OfflineFallback,RemoteTab,RemoteCrashBoundary}.tsx` | Modify | Mechanical palette-class swap. |
| `portfolio-website/public/assets/space.jpeg` | Delete | No longer used. |
| `portfolio-website/public/assets/space-arp-f-chords.wav` | Delete | No longer used. |

---

## Palette mapping table (used by Tasks 4–8)

When sweeping legacy classes, apply mechanically:

| Legacy class | Replacement |
|---|---|
| `text-neutral-100` | `text-[var(--orchard-cream)]` |
| `text-neutral-200` | `text-[var(--orchard-cream)]/90` |
| `text-neutral-300` | `text-[var(--orchard-cream)]/80` |
| `text-neutral-400` | `text-[var(--orchard-cream)]/65` |
| `text-neutral-500` | `text-[var(--orchard-cream)]/50` |
| `text-neutral-600` | `text-[var(--orchard-cream)]/40` |
| `text-blue-400` | `text-[var(--orchard-honey)]` |
| `text-white` | `text-[var(--orchard-cream)]` |
| `text-black` | `text-[var(--orchard-bark)]` |
| `bg-neutral-900` | `bg-[var(--orchard-bark)]` |
| `bg-neutral-900/50` | `bg-[var(--orchard-moss)]/40` |
| `bg-neutral-950` | `bg-[var(--orchard-bark)]` |
| `bg-black` | `bg-[var(--orchard-bark)]` |
| `bg-black/30` | `bg-[var(--orchard-bark)]/45` |
| `bg-black/60` | `bg-[var(--orchard-bark)]/65` |
| `bg-white` | `bg-[var(--orchard-honey)]` (CTA) or `bg-[var(--orchard-cream)]` (neutral surface) — pick by context |
| `border-neutral-600` | `border-[var(--orchard-fern)]/50` |
| `border-neutral-700` | `border-[var(--orchard-moss)]` |
| `border-neutral-800` | `border-[var(--orchard-moss)]/70` |
| `border-neutral-100` | `border-[var(--orchard-cream)]/60` |
| `hover:bg-neutral-200` | `hover:bg-[var(--orchard-honey)]/80` (CTA) |
| `hover:bg-neutral-900/50` | `hover:bg-[var(--orchard-moss)]/40` |
| `hover:border-neutral-600` | `hover:border-[var(--orchard-honey)]/50` |
| `hover:text-white` | `hover:text-[var(--orchard-cream)]` |

If a class isn't in the table, choose the closest mapping by intent (text/bg/border + role).

---

## Task 1: Foundation — tokens, fonts, body

Establishes the design system. Everything downstream references these. Visual changes are immediate when you run `npm run dev` — the body background turns deep green and Fraunces + Lato become available.

**Files:**
- Modify: `portfolio-website/index.html`
- Modify: `portfolio-website/src/index.css`
- Modify: `portfolio-website/src/App.css`

- [ ] **Step 1: Add Google Fonts `<link>` tags to `index.html`**

Replace the current `<head>` contents (lines 3-7) with:

```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Lato:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <title>Mason Stevens — Portfolio</title>
  </head>
```

(Also updates the title from `Vite + React + TS` to a real one.)

- [ ] **Step 2: Overwrite `src/index.css` with token system**

Exact contents:

```css
@import "tailwindcss";

:root {
  /* Orchard palette */
  --orchard-bark: #1f2a1f;
  --orchard-moss: #3a4a2c;
  --orchard-fern: #6b7a45;
  --orchard-honey: #d8a850;
  --orchard-amber: #c8804a;
  --orchard-cream: #e8d8a8;

  font-family: "Lato", system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: dark;
  color: var(--orchard-cream);
  background-color: var(--orchard-bark);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--orchard-bark);
  position: relative;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.18;
  background-image:
    radial-gradient(rgba(248, 226, 176, 0.10) 0.8px, transparent 0.8px),
    radial-gradient(rgba(20, 30, 15, 0.18) 0.8px, transparent 0.8px);
  background-size: 3px 3px, 4px 4px;
  background-position: 0 0, 1px 2px;
}

h1, h2, h3, h4, .display {
  font-family: "Fraunces", Georgia, serif;
  font-variation-settings: "opsz" 144;
}
```

- [ ] **Step 3: Strip `src/App.css` to root container only**

Exact contents:

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```

(Removes the `.logo`, `.logo:hover`, `.logo.react:hover`, `logo-spin` keyframes, `prefers-reduced-motion` block, `.card`, and `.read-the-docs` rules — all Vite scaffold leftovers, none currently referenced.)

- [ ] **Step 4: Build to confirm no syntax errors**

Run from `portfolio-website/`:

```bash
npm run build
```

Expected: TypeScript compile and Vite build pass.

- [ ] **Step 5: Commit**

```bash
git add portfolio-website/index.html portfolio-website/src/index.css portfolio-website/src/App.css
git commit -m "$(cat <<'EOF'
feat(portfolio): add orchard palette tokens + Fraunces/Lato fonts

Defines --orchard-* CSS variables, body background + grain overlay,
global font stacks. Strips Vite scaffold styles from App.css.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 3D scene rewrite (single commit)

Replaces the Earth + stars + space.jpeg scene with three z-depth firefly layers plus drifting petals, with scroll-tied per-layer parallax and a new mouse-parallax hook. This is one coherent unit across four files — don't commit intermediate states.

**Files:**
- Create: `portfolio-website/src/utils/hooks/useMouseParallax.tsx`
- Create: `portfolio-website/src/utils/hooks/useMouseParallax.test.ts`
- Modify: `portfolio-website/src/utils/hooks/useScrollListen.tsx`
- Modify: `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`
- Modify: `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`

- [ ] **Step 1: Write the failing test for `normalizeMousePosition`**

Create `portfolio-website/src/utils/hooks/useMouseParallax.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd portfolio-website && npm test -- useMouseParallax.test
```

Expected: FAIL with "Failed to resolve import './useMouseParallax'".

- [ ] **Step 3: Implement `useMouseParallax`**

Create `portfolio-website/src/utils/hooks/useMouseParallax.tsx`:

```tsx
import { useEffect, useRef } from "react";

export interface MouseParallaxOffset {
  x: number; // -0.5 .. 0.5
  y: number; // -0.5 .. 0.5
}

export const normalizeMousePosition = (
  clientX: number,
  clientY: number,
  width: number,
  height: number
): MouseParallaxOffset => ({
  x: clientX / width - 0.5,
  y: clientY / height - 0.5,
});

export const useMouseParallax = () => {
  const ref = useRef<MouseParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current = normalizeMousePosition(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return ref;
};
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd portfolio-website && npm test -- useMouseParallax.test
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Refactor `useScrollListen` — strip earth, keep scroll-spy**

Overwrite `portfolio-website/src/utils/hooks/useScrollListen.tsx`:

```tsx
import { useEffect } from "react";
import { useAppDispatch } from "./reduxHooks";
import {
  HeaderSelected,
  setHeaderSelected,
} from "../../redux/slices/globalData";

// Scroll-spy thresholds (start of each section as the user scrolls
// down). Hand-tuned to feel natural with the parallax sections that
// overlap visually — adjust by eye if the highlight changes too
// early or too late at any boundary.
const SPY_THRESHOLDS = {
  aboutMe: 0.5,
  featuredWork: 1.5,
  contact: 2.1,
};

export const useScrollListen = (scroll: number, pageScrolledTime: Date) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const rightNow = new Date();

    // Skip header updates while the parallax animation is still
    // mid-flight after a click-driven scrollTo (otherwise the
    // highlight flickers through the passing sections).
    if (rightNow.getTime() - pageScrolledTime.getTime() <= 1400) return;

    let activeSection: HeaderSelected;
    if (scroll < SPY_THRESHOLDS.aboutMe) {
      activeSection = HeaderSelected.WELCOME;
    } else if (scroll < SPY_THRESHOLDS.featuredWork) {
      activeSection = HeaderSelected.ABOUT_ME;
    } else if (scroll < SPY_THRESHOLDS.contact) {
      activeSection = HeaderSelected.FEATURED_WORK;
    } else {
      activeSection = HeaderSelected.CONTACT;
    }
    dispatch(setHeaderSelected(activeSection));
  }, [scroll, pageScrolledTime, dispatch]);
};
```

(Drops `THREE` import, drops earth state + rotation, drops `rotateToZero` and `moveCamera`. Hook now returns `void`.)

- [ ] **Step 6: Rewrite `useThreeSceneMount`**

Overwrite `portfolio-website/src/utils/hooks/useThreeSceneMount.tsx`:

```tsx
import { RefObject, useEffect } from "react";
import * as THREE from "three";
import type { MouseParallaxOffset } from "./useMouseParallax";

const FAR_COUNT = 80;
const MID_COUNT = 50;
const NEAR_COUNT = 25;
const PETAL_COUNT = 20;

const SPREAD_X = 120;
const SPREAD_Y = 80;

// Build a soft glow sprite procedurally.
const buildGlowTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0.0, "rgba(248, 226, 176, 1.0)");
  g.addColorStop(0.35, "rgba(216, 168, 80, 0.55)");
  g.addColorStop(1.0, "rgba(216, 168, 80, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

// Soft elliptical blossom-petal sprite with a hint of pink.
const buildPetalTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
  g.addColorStop(0.0, "rgba(255, 220, 220, 0.95)");
  g.addColorStop(0.6, "rgba(248, 200, 200, 0.45)");
  g.addColorStop(1.0, "rgba(248, 168, 168, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(32, 32, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
};

// Bark→moss radial gradient as the scene background.
const buildBackgroundTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 200, 60, 256, 280, 360);
  g.addColorStop(0.0, "#3a4a2c"); // moss highlight
  g.addColorStop(0.5, "#2a3a22"); // mid
  g.addColorStop(1.0, "#15201a"); // deep bark
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
};

// Build a Points field at a given z with N points scattered across a
// wide rectangle. Returns the Points object and the per-particle
// phase array used for idle drift.
const buildFireflyLayer = (
  count: number,
  size: number,
  z: number,
  glow: THREE.CanvasTexture
): { points: THREE.Points; phases: Float32Array; basePositions: Float32Array } => {
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

interface PetalState {
  mesh: THREE.Mesh;
  fallSpeed: number;
  spinSpeed: number;
}

const buildPetal = (texture: THREE.CanvasTexture): PetalState => {
  const geometry = new THREE.PlaneGeometry(2.5, 1.6);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * SPREAD_X,
    Math.random() * SPREAD_Y,
    -5 + Math.random() * 15
  );
  mesh.rotation.z = Math.random() * Math.PI * 2;
  return {
    mesh,
    fallSpeed: 0.04 + Math.random() * 0.08,
    spinSpeed: (Math.random() - 0.5) * 0.01,
  };
};

export const useThreeSceneMount = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  scrollRef: RefObject<number>,
  mouseRef: RefObject<MouseParallaxOffset>
) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = buildBackgroundTexture();

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

    // Layers
    const glow = buildGlowTexture();
    const petalTex = buildPetalTexture();

    const far = buildFireflyLayer(FAR_COUNT, 0.6, -40, glow);
    const mid = buildFireflyLayer(MID_COUNT, 1.1, -10, glow);
    const near = buildFireflyLayer(NEAR_COUNT, 2.0, 10, glow);

    const farGroup = new THREE.Group();
    farGroup.add(far.points);
    const midGroup = new THREE.Group();
    midGroup.add(mid.points);
    const nearGroup = new THREE.Group();
    nearGroup.add(near.points);

    scene.add(farGroup, midGroup, nearGroup);

    const petals: PetalState[] = [];
    const petalGroup = new THREE.Group();
    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = buildPetal(petalTex);
      petals.push(p);
      petalGroup.add(p.mesh);
    }
    scene.add(petalGroup);

    // Smoothed mouse offset (lerped toward mouseRef each frame)
    let smoothMx = 0;
    let smoothMy = 0;

    let frame = 0;
    let rafId = 0;

    const animate = () => {
      frame++;
      const t = frame * 0.01;

      // Per-particle idle drift (sinusoidal jitter around base position)
      const updateLayer = (
        layer: { points: THREE.Points; phases: Float32Array; basePositions: Float32Array },
        amplitude: number
      ) => {
        const posAttr = layer.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < layer.phases.length; i++) {
          const phase = layer.phases[i];
          arr[i * 3 + 0] =
            layer.basePositions[i * 3 + 0] + Math.sin(t + phase) * amplitude;
          arr[i * 3 + 1] =
            layer.basePositions[i * 3 + 1] + Math.cos(t * 0.7 + phase) * amplitude;
        }
        posAttr.needsUpdate = true;
      };
      updateLayer(far, 0.4);
      updateLayer(mid, 0.7);
      updateLayer(near, 1.1);

      // Petal fall + rotate + wrap
      for (const p of petals) {
        p.mesh.position.y -= p.fallSpeed;
        p.mesh.rotation.z += p.spinSpeed;
        if (p.mesh.position.y < -SPREAD_Y / 2) {
          p.mesh.position.y = SPREAD_Y / 2;
          p.mesh.position.x = (Math.random() - 0.5) * SPREAD_X;
        }
      }

      // Scroll-tied depth parallax. Group y offset scales with scroll
      // and per-layer multiplier (near moves most, far moves least).
      const s = scrollRef.current ?? 0;
      farGroup.position.y = -s * 1.2;
      midGroup.position.y = -s * 3.6;
      nearGroup.position.y = -s * 8.0;
      petalGroup.position.y = -s * 6.0;

      // Mouse parallax — lerp toward target, scale per layer.
      const tx = mouseRef.current?.x ?? 0;
      const ty = mouseRef.current?.y ?? 0;
      smoothMx += (tx - smoothMx) * 0.05;
      smoothMy += (ty - smoothMy) * 0.05;
      farGroup.position.x = smoothMx * 0.5;
      midGroup.position.x = smoothMx * 1.5;
      nearGroup.position.x = smoothMx * 3.0;
      petalGroup.position.x = smoothMx * 2.0;
      // small vertical mouse component (offset, not absolute)
      farGroup.position.y += smoothMy * -0.3;
      midGroup.position.y += smoothMy * -1.0;
      nearGroup.position.y += smoothMy * -2.0;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      glow.dispose();
      petalTex.dispose();
      far.points.geometry.dispose();
      (far.points.material as THREE.Material).dispose();
      mid.points.geometry.dispose();
      (mid.points.material as THREE.Material).dispose();
      near.points.geometry.dispose();
      (near.points.material as THREE.Material).dispose();
      for (const p of petals) {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      }
      (scene.background as THREE.CanvasTexture).dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
```

- [ ] **Step 7: Wire up `InfiniteScrollContainer`**

Overwrite `portfolio-website/src/components/home/InfiniteScrollContainer.tsx`:

```tsx
/*
  InfiniteScrollContainer
*/

import { useEffect, useRef } from "react";
import { Parallax } from "@react-spring/parallax";
import { useParallaxScroll } from "../../utils/hooks/useParallaxScroll";
import { WelcomeBlock } from "./WelcomeBlock";
import { useAppSelector } from "../../utils/hooks/reduxHooks";
import { HeaderSelected } from "../../redux/slices/globalData";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
import { AboutMeBlock } from "./AboutMeBlock";
import { ContactBlock } from "./ContactBlock";
import { useScrollListen } from "../../utils/hooks/useScrollListen";
import { headerToPageMap } from "../../utils/headerToPageMap";
import { useHeaderSelectionListener } from "../../utils/hooks/useHeaderSelectionListener";
import { useThreeSceneMount } from "../../utils/hooks/useThreeSceneMount";
import { useMouseParallax } from "../../utils/hooks/useMouseParallax";

interface Props {}

export const InfiniteScrollContainer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);

  const headerSelected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  const pageScrolledTime = useHeaderSelectionListener(
    parallaxRef,
    headerSelected
  );

  const scroll = useParallaxScroll();
  const scrollRef = useRef(scroll);
  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);

  useScrollListen(scroll, pageScrolledTime);
  const mouseRef = useMouseParallax();
  useThreeSceneMount(canvasRef, scrollRef, mouseRef);

  return (
    <div className="left-0 top-0 fixed w-full h-full items-right">
      <canvas
        ref={canvasRef}
        id="bg"
        className="fixed top-0 left-0 w-full h-full"
      />

      <div className="left-0 top-0 fixed z-1 w-full h-full">
        <Parallax className="parallax" pages={4} ref={parallaxRef}>
          <WelcomeBlock {...headerToPageMap[HeaderSelected.WELCOME]} />
          <AboutMeBlock {...headerToPageMap[HeaderSelected.ABOUT_ME]} />
          <FeaturedWorkBlock
            {...headerToPageMap[HeaderSelected.FEATURED_WORK]}
          />
          <ContactBlock {...headerToPageMap[HeaderSelected.CONTACT]} />
        </Parallax>
      </div>
    </div>
  );
};
```

(Removes `THREE` import, removes `useAppDispatch`/`HeaderSelected.WELCOME` dispatch path, removes `useAmbientSound` import that was already commented out, converts scroll value → scroll ref for the three.js loop, calls `useMouseParallax`.)

- [ ] **Step 8: Build + lint + test**

```bash
cd portfolio-website && npm run build && npm run lint && npm test
```

Expected: build passes, no new lint errors, all tests pass.

- [ ] **Step 9: Manual smoke check**

```bash
cd portfolio-website && npm run dev
```

Open the dev URL. Confirm:
- Background is a green→dark gradient (no Earth, no stars).
- Tiny warm dots drift across the screen at multiple sizes.
- Scrolling the parallax moves the dots; near (large/bright) ones move more than far (small/dim) ones.
- Moving the cursor nudges the field horizontally.
- A few soft pink petal shapes slowly fall.
- Resize the window — scene resizes.

Kill dev server (Ctrl-C).

- [ ] **Step 10: Commit**

```bash
git add portfolio-website/src/utils/hooks/useMouseParallax.tsx \
        portfolio-website/src/utils/hooks/useMouseParallax.test.ts \
        portfolio-website/src/utils/hooks/useScrollListen.tsx \
        portfolio-website/src/utils/hooks/useThreeSceneMount.tsx \
        portfolio-website/src/components/home/InfiniteScrollContainer.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): replace earth+stars scene with firefly+petal field

Rewrites useThreeSceneMount to render three z-depth firefly point
layers plus drifting apple-blossom petals, with scroll-tied per-layer
depth parallax and a new useMouseParallax hook for cursor-reactive
drift. useScrollListen drops earth handling and retains scroll-spy
only. InfiniteScrollContainer wires the new hooks via a scrollRef.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Ambient audio swap

Replaces space-arp with crickets. The audio asset must be sourced manually; the implementing agent should pause and ask the user to drop the file into place before proceeding to Step 3.

**Files:**
- Create: `portfolio-website/public/assets/crickets-dusk.ogg`
- Modify: `portfolio-website/src/components/home/Header.tsx`

- [ ] **Step 1: Source the crickets audio file**

The implementing agent should pause here and ask the user to download a seamlessly-looping crickets-at-dusk ambient loop from freesound.org (CC0 or CC-BY) and drop it at `portfolio-website/public/assets/crickets-dusk.ogg`. Length 20–40 s. Volume normalized.

Suggested freesound queries: "crickets night loop", "crickets dusk ambient". Filter by Creative Commons 0 license.

Do not proceed to Step 2 until the file is in place. Verify:

```bash
ls -la portfolio-website/public/assets/crickets-dusk.ogg
```

Expected: file exists, size > 100 KB.

- [ ] **Step 2: Update `Header.tsx` audio path + toggle emoji**

In `portfolio-website/src/components/home/Header.tsx`, find this block (lines 28-31):

```tsx
  const { toggleMute, paused } = useAmbientSound(
    "/assets/space-arp-f-chords.wav",
    0.1
  );
```

Replace with:

```tsx
  const { toggleMute, paused } = useAmbientSound(
    "/assets/crickets-dusk.ogg",
    0.1
  );
```

Find this block (lines 71-77):

```tsx
          <button
            onClick={toggleMute}
            className="text-white hover:text-neutral-300 text-xl"
            title="Toggle ambient audio"
          >
            {paused ? "🔇" : "🔊"}
          </button>
```

Replace with:

```tsx
          <button
            onClick={toggleMute}
            className="text-[var(--orchard-cream)] hover:text-[var(--orchard-honey)] text-xl"
            title="Toggle ambient audio"
          >
            {paused ? "🔇" : "🦗"}
          </button>
```

(Note: full token swap of the Header nav chrome happens in Task 4. This step does only the audio bits so the audio change is its own commit.)

- [ ] **Step 3: Smoke-check the audio**

```bash
cd portfolio-website && npm run dev
```

Click the audio toggle in the top right. Confirm crickets loop plays, emoji switches `🔇 → 🦗`. Click again to mute. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add portfolio-website/public/assets/crickets-dusk.ogg \
        portfolio-website/src/components/home/Header.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): swap space-arp ambient audio for crickets-at-dusk

Adds crickets-dusk.ogg loop; updates Header to use it. Toggle emoji
becomes 🔇/🦗 to match the new orchard identity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Retheme Header chrome

Replace the Header's nav-state palette with orchard tokens. Audio toggle classes are already updated from Task 3.

**Files:**
- Modify: `portfolio-website/src/components/home/Header.tsx`

- [ ] **Step 1: Update Header nav classes**

In `portfolio-website/src/components/home/Header.tsx`, find the outer wrapper (line 50):

```tsx
    <div className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-sm px-8 py-4">
```

Replace with:

```tsx
    <div className="fixed top-0 left-0 w-full z-50 bg-[var(--orchard-bark)]/65 backdrop-blur-sm border-b border-[var(--orchard-honey)]/15 px-8 py-4">
```

Find the inner row (line 51):

```tsx
      <div className="relative max-w-7xl mx-auto flex items-center justify-center text-neutral-100">
```

Replace with:

```tsx
      <div className="relative max-w-7xl mx-auto flex items-center justify-center text-[var(--orchard-cream)]">
```

Find the nav buttons block (lines 55-66):

```tsx
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`transition-colors duration-300 text-base md:text-lg ${
                selected === item.id
                  ? "text-white font-bold underline underline-offset-4"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
```

Replace with:

```tsx
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`transition-colors duration-300 text-base md:text-lg ${
                selected === item.id
                  ? "text-[var(--orchard-cream)] font-bold underline underline-offset-4 decoration-[var(--orchard-honey)]"
                  : "text-[var(--orchard-cream)]/60 hover:text-[var(--orchard-cream)]"
              }`}
            >
              {item.label}
            </button>
```

- [ ] **Step 2: Build + smoke-check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Open the dev URL. Confirm the header bar is now a translucent green-brown with cream text, active tab underlined in honey. Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add portfolio-website/src/components/home/Header.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): retheme Header chrome with orchard palette

Header bar uses orchard-bark/65 + honey border; active tab decoration
in honey; inactive tabs use cream/60 hover→cream.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Retheme Welcome + About blocks

Token swap on the two top-of-home blocks. Frosted glass becomes warm-tinted.

**Files:**
- Modify: `portfolio-website/src/components/home/WelcomeBlock.tsx`
- Modify: `portfolio-website/src/components/home/AboutMeBlock.tsx`

- [ ] **Step 1: Update `WelcomeBlock.tsx`**

In `portfolio-website/src/components/home/WelcomeBlock.tsx`, find the glass card (lines 22-27):

```tsx
        <div className="bg-black/30 rounded-3xl shadow-lg backdrop-blur-lg p-10 max-w-4xl w-full flex flex-col items-end text-right gap-6">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-100">
            Welcome to My Portfolio
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-300">
            Showcasing UI/UX, Web Projects & Creative Tools
          </h2>
```

Replace with:

```tsx
        <div className="bg-[var(--orchard-bark)]/45 rounded-3xl shadow-lg backdrop-blur-lg border border-[var(--orchard-honey)]/15 p-10 max-w-4xl w-full flex flex-col items-end text-right gap-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--orchard-cream)]">
            Welcome to My Portfolio
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--orchard-cream)]/80">
            Showcasing UI/UX, Web Projects & Creative Tools
          </h2>
```

- [ ] **Step 2: Update `AboutMeBlock.tsx`**

In `portfolio-website/src/components/home/AboutMeBlock.tsx`, find the glass card (lines 22-40):

```tsx
        <div className="bg-black/30 rounded-3xl shadow-lg backdrop-blur-lg p-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8">
          <img
            src="/assets/profile.jpg" // replace with your actual profile path
            alt="Profile photo"
            className="w-48 h-48 rounded-full object-cover border-4 border-neutral-100 shadow-md"
          />
          <div className="text-left text-neutral-100">
            <h1 className="text-5xl font-bold mb-4">Hi, I'm Mason</h1>
            <p className="text-lg leading-relaxed text-neutral-300">
              I'm a designer, developer, and nature enthusiast building tools
              that connect people to plants. With a background in UX, spatial
              computing, and frontend systems, I focus on crafting interactive
              experiences that feel natural, intuitive, and beautiful.
            </p>
            <p className="text-lg mt-4 text-neutral-400">
              Outside of work, you'll find me in my orchard, sketching
              interfaces, or mountain biking trails around Winston-Salem.
            </p>
          </div>
        </div>
```

Replace with:

```tsx
        <div className="bg-[var(--orchard-bark)]/45 rounded-3xl shadow-lg backdrop-blur-lg border border-[var(--orchard-honey)]/15 p-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8">
          <img
            src="/assets/profile.jpg"
            alt="Profile photo"
            className="w-48 h-48 rounded-full object-cover border-4 border-[var(--orchard-cream)]/30 shadow-md"
          />
          <div className="text-left text-[var(--orchard-cream)]">
            <h1 className="text-5xl font-bold mb-4">Hi, I'm Mason</h1>
            <p className="text-lg leading-relaxed text-[var(--orchard-cream)]/85">
              I'm a designer, developer, and nature enthusiast building tools
              that connect people to plants. With a background in UX, spatial
              computing, and frontend systems, I focus on crafting interactive
              experiences that feel natural, intuitive, and beautiful.
            </p>
            <p className="text-lg mt-4 text-[var(--orchard-cream)]/65">
              Outside of work, you'll find me in my orchard, sketching
              interfaces, or mountain biking trails around Winston-Salem.
            </p>
          </div>
        </div>
```

- [ ] **Step 3: Build + smoke-check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Scroll the homepage. Confirm Welcome and About blocks have warm-tinted frosted glass with honey-edged borders. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add portfolio-website/src/components/home/WelcomeBlock.tsx \
        portfolio-website/src/components/home/AboutMeBlock.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): retheme Welcome + About blocks with orchard palette

Frosted glass becomes orchard-bark/45 with honey-edged border;
text uses cream tones at varying opacities.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Retheme FeaturedWork + Contact + ProfessionalGoals

**Files:**
- Modify: `portfolio-website/src/components/home/FeaturedWorkBlock.tsx`
- Modify: `portfolio-website/src/components/home/ContactBlock.tsx`
- Modify: `portfolio-website/src/components/home/ProfessionalGoalsBlock.tsx`

- [ ] **Step 1: Update `FeaturedWorkBlock.tsx`**

In `portfolio-website/src/components/home/FeaturedWorkBlock.tsx`, find the H1 (line 93):

```tsx
        <h1 className="text-5xl font-bold mb-12">Featured Work</h1>
```

Replace with:

```tsx
        <h1 className="text-5xl font-bold mb-12 text-[var(--orchard-cream)]">Featured Work</h1>
```

Find each tile's background (line 110):

```tsx
                className="transition-all duration-500 ease-in-out cursor-pointer relative group overflow-hidden bg-black/30"
```

Replace with:

```tsx
                className="transition-all duration-500 ease-in-out cursor-pointer relative group overflow-hidden bg-[var(--orchard-bark)]/45"
```

Find the hover gradient overlay (line 117):

```tsx
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 z-10">
```

Replace with:

```tsx
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--orchard-bark)] via-[var(--orchard-bark)]/70 to-transparent p-4 z-10">
```

Find the title (line 118):

```tsx
                  <h3 className="text-xl text-white font-semibold [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">
```

Replace with:

```tsx
                  <h3 className="text-xl text-[var(--orchard-cream)] font-semibold [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">
```

Find the description (line 122):

```tsx
                    <p className="text-sm text-neutral-200 mt-2 transition-opacity duration-300 [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
```

Replace with:

```tsx
                    <p className="text-sm text-[var(--orchard-cream)]/85 mt-2 transition-opacity duration-300 [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">
```

Find the "View all projects →" link (lines 131-135):

```tsx
        <Link
          to="/projects"
          className="mt-6 text-neutral-300 hover:text-white text-base md:text-lg underline-offset-4 hover:underline transition-colors"
        >
          View all projects →
        </Link>
```

Replace with:

```tsx
        <Link
          to="/projects"
          className="mt-6 text-[var(--orchard-honey)]/80 hover:text-[var(--orchard-honey)] text-base md:text-lg underline-offset-4 hover:underline transition-colors"
        >
          View all projects →
        </Link>
```

- [ ] **Step 2: Update `ContactBlock.tsx`**

In `portfolio-website/src/components/home/ContactBlock.tsx`, find the wrapper (line 16):

```tsx
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-neutral-100">
```

Replace with:

```tsx
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-[var(--orchard-cream)]">
```

Find the lead text (line 18):

```tsx
        <p className="text-lg mb-8 text-center text-neutral-300 max-w-2xl">
```

Replace with:

```tsx
        <p className="text-lg mb-8 text-center text-[var(--orchard-cream)]/80 max-w-2xl">
```

Find the CTA (lines 23-26):

```tsx
          <a
            href="mailto:youremail@example.com"
            className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 transition"
          >
            Send an Email
          </a>
```

Replace with:

```tsx
          <a
            href="mailto:youremail@example.com"
            className="bg-[var(--orchard-honey)] text-[var(--orchard-bark)] px-6 py-2 rounded-md font-semibold hover:bg-[var(--orchard-honey)]/80 transition"
          >
            Send an Email
          </a>
```

Find the helper text (line 29):

```tsx
          <div className="text-sm text-neutral-400">
```

Replace with:

```tsx
          <div className="text-sm text-[var(--orchard-cream)]/65">
```

- [ ] **Step 3: Update `ProfessionalGoalsBlock.tsx`**

In `portfolio-website/src/components/home/ProfessionalGoalsBlock.tsx`, find the wrapper card (line 48):

```tsx
        <div className="max-w-6xl w-full bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
```

Replace with:

```tsx
        <div className="max-w-6xl w-full bg-[var(--orchard-bark)]/45 backdrop-blur-md border border-[var(--orchard-honey)]/15 rounded-xl p-6 shadow-xl">
```

Find the heading (line 49):

```tsx
          <h1 className="text-4xl text-center font-bold text-neutral-100 mb-8">
```

Replace with:

```tsx
          <h1 className="text-4xl text-center font-bold text-[var(--orchard-cream)] mb-8">
```

Find the `Chrono` theme block (lines 56-61):

```tsx
            theme={{
              primary: "#3b82f6", // Tailwind blue-500
              secondary: "#111827", // Tailwind gray-900
              cardBgColor: "#1f2937", // Tailwind gray-800
              cardForeColor: "#f9fafb", // Tailwind gray-50
            }}
```

Replace with:

```tsx
            theme={{
              primary: "#d8a850", // orchard-honey
              secondary: "#1f2a1f", // orchard-bark
              cardBgColor: "#3a4a2c", // orchard-moss
              cardForeColor: "#e8d8a8", // orchard-cream
            }}
```

(Chrono's `theme` prop takes literal hex strings, not CSS variables — that's why these go inline as hex values matching the `--orchard-*` tokens.)

- [ ] **Step 4: Build + smoke-check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Scroll the homepage. Confirm Featured Work tiles have warm hover gradients, "View all projects →" link is honey, Contact CTA is honey-on-bark. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add portfolio-website/src/components/home/FeaturedWorkBlock.tsx \
        portfolio-website/src/components/home/ContactBlock.tsx \
        portfolio-website/src/components/home/ProfessionalGoalsBlock.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): retheme FeaturedWork + Contact + ProfessionalGoals

FeaturedWork tile bg + hover gradient + footer link use orchard
tokens. Contact CTA is honey-on-bark. ProfessionalGoals palette
swept for the (currently-unrouted) future.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Retheme ProjectsIndexPage + ProjectPageTemplate

**Files:**
- Modify: `portfolio-website/src/pages/ProjectsIndexPage.tsx`
- Modify: `portfolio-website/src/pages/ProjectPageTemplate.tsx`

- [ ] **Step 1: Update `ProjectPageTemplate.tsx`**

In `portfolio-website/src/pages/ProjectPageTemplate.tsx`, find the outer wrapper (line 19):

```tsx
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100 py-16 px-4 md:px-8">
```

Replace with:

```tsx
    <div className="min-h-screen w-full bg-[var(--orchard-bark)] text-[var(--orchard-cream)] py-16 px-4 md:px-8">
```

Find the back button (lines 22-28):

```tsx
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-sm font-medium"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
```

Replace with:

```tsx
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[var(--orchard-cream)]/70 hover:text-[var(--orchard-honey)] transition-colors text-sm font-medium"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
```

Find the subtitle (line 35):

```tsx
            <p className="text-xl md:text-2xl text-neutral-400">{subtitle}</p>
```

Replace with:

```tsx
            <p className="text-xl md:text-2xl text-[var(--orchard-cream)]/65">{subtitle}</p>
```

- [ ] **Step 2: Update `ProjectsIndexPage.tsx`**

In `portfolio-website/src/pages/ProjectsIndexPage.tsx`, find the project card link (line 99):

```tsx
              className="flex gap-4 items-start p-4 rounded-lg border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 transition-colors"
```

Replace with:

```tsx
              className="flex gap-4 items-start p-4 rounded-lg border border-[var(--orchard-moss)]/70 hover:border-[var(--orchard-honey)]/50 hover:bg-[var(--orchard-moss)]/40 transition-colors"
```

Find the placeholder thumb (lines 103-108):

```tsx
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-32 h-32 object-cover rounded flex-shrink-0 bg-neutral-900"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-32 h-32 rounded flex-shrink-0 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-3xl text-neutral-600 font-semibold"
                >
```

Replace with:

```tsx
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-32 h-32 object-cover rounded flex-shrink-0 bg-[var(--orchard-moss)]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-32 h-32 rounded flex-shrink-0 bg-[var(--orchard-moss)] border border-[var(--orchard-moss)]/70 flex items-center justify-center text-3xl text-[var(--orchard-cream)]/40 font-semibold"
                >
```

Find the project title (line 116):

```tsx
                <h3 className="text-xl text-neutral-100 font-semibold mb-1">
```

Replace with:

```tsx
                <h3 className="text-xl text-[var(--orchard-cream)] font-semibold mb-1">
```

Find the description (line 119):

```tsx
                <p className="text-neutral-400 mb-2">{project.description}</p>
```

Replace with:

```tsx
                <p className="text-[var(--orchard-cream)]/65 mb-2">{project.description}</p>
```

Find the "View project →" link (line 120):

```tsx
                <span className="text-sm text-blue-400">View project →</span>
```

Replace with:

```tsx
                <span className="text-sm text-[var(--orchard-honey)]">View project →</span>
```

- [ ] **Step 3: Build + smoke-check**

```bash
cd portfolio-website && npm run build && npm run dev
```

Click "View all projects →" from the homepage. Confirm the index list uses bark background, moss borders, honey links, and the back button hover is honey. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add portfolio-website/src/pages/ProjectsIndexPage.tsx \
        portfolio-website/src/pages/ProjectPageTemplate.tsx
git commit -m "$(cat <<'EOF'
feat(portfolio): retheme ProjectsIndex + ProjectPageTemplate

Project shell uses orchard-bark background, moss borders, honey
links and back-button hover.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Sweep project pages

Mechanical palette-class swap across the 11 project pages and the three calculator-subdir files that have palette classes.

**Files:**
- Modify: `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/GaribaldiPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/GuadalcanalPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/PrReaderPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/SingleLineDrawerPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/VespucciPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/VoiceGardenPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/YardenPage.tsx`
- Modify: `portfolio-website/src/pages/projectPages/calculators/OfflineFallback.tsx`
- Modify: `portfolio-website/src/pages/projectPages/calculators/RemoteTab.tsx`
- Modify: `portfolio-website/src/pages/projectPages/calculators/RemoteCrashBoundary.tsx`

(Three pages have 0 palette-class hits and don't need changes: `HortibasePage.tsx`, `VicSavePage.tsx`, `PicturePixelArtPage.tsx`. Skip them.)

- [ ] **Step 1: Sweep each file**

For each file in the list above:

1. Read the file with the `Read` tool.
2. For every class string containing `neutral-`, `bg-black`, `text-blue-`, `bg-white`, `text-white`, `text-black`, `bg-slate-`, or `bg-gray-`, apply the mapping from the palette table at the top of this plan.
3. Use the `Edit` tool to apply each replacement. If a string appears multiple times in a file, use `replace_all: true`.

If a class isn't in the table, choose the closest mapping by intent (text/bg/border + role). Don't introduce new tokens — stick to the six `--orchard-*` variables.

- [ ] **Step 2: Verify no legacy palette classes remain**

```bash
grep -rn "neutral-\|bg-black\|text-blue-\|bg-white\|text-white\|text-black\|bg-slate-\|bg-gray-" \
  portfolio-website/src/pages/projectPages/ 2>/dev/null
```

Expected: no output (or only matches inside `// comments` or string literals that aren't class names).

If any class-string matches remain, repeat Step 1 on that file.

- [ ] **Step 3: Build + lint**

```bash
cd portfolio-website && npm run build && npm run lint
```

Expected: build passes, no new lint errors.

- [ ] **Step 4: Manual walkthrough**

```bash
cd portfolio-website && npm run dev
```

Click into each of these project routes and confirm no white-on-white, no blue accents, no remaining grey backgrounds:
- `/projects`
- `/projects/yarden-diy`
- `/projects/garibaldi`
- `/projects/calculators`
- `/projects/vespucci`
- `/projects/guadalcanal`
- `/projects/pr-reader-vscode`
- `/projects/picture-to-pixel-art`
- `/projects/voice-garden`
- `/projects/vicsave-compiler`
- `/projects/hortibase`
- `/projects/single-line-drawer`

Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add portfolio-website/src/pages/projectPages/
git commit -m "$(cat <<'EOF'
feat(portfolio): sweep project pages onto orchard palette

Mechanical token swap across 11 project pages and three calculator-
subdir surfaces. Replaces neutral-*, bg-black, text-blue-, bg-white
references with the --orchard-* token system.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Cleanup old assets + final verification

Delete unused space-themed assets and do the end-to-end manual walkthrough from the spec's Verification section.

**Files:**
- Delete: `portfolio-website/public/assets/space.jpeg`
- Delete: `portfolio-website/public/assets/space-arp-f-chords.wav`

- [ ] **Step 1: Confirm assets are unreferenced**

```bash
grep -rn "space\.jpeg\|space-arp-f-chords" portfolio-website/src/ 2>/dev/null
```

Expected: no output. If any reference remains, find and remove it before deleting the file.

- [ ] **Step 2: Delete the files**

```bash
rm portfolio-website/public/assets/space.jpeg
rm portfolio-website/public/assets/space-arp-f-chords.wav
```

- [ ] **Step 3: Full build + lint + test**

```bash
cd portfolio-website && npm run build && npm run lint && npm test
```

Expected: all three pass.

- [ ] **Step 4: End-to-end manual walkthrough**

```bash
cd portfolio-website && npm run dev
```

Walk through the entire spec Verification checklist:

- **Homepage scroll** — scroll Welcome → About → Featured Work → Contact end to end. Confirm depth parallax (near fireflies travel further per scroll-step than far), petals drift down, mouse moves nudge the field.
- **Header** — click each tab, confirm active state underlined in honey; click audio toggle, confirm crickets loop plays and emoji updates `🔇 → 🦗 → 🔇`.
- **Featured Work** — hover each tile, confirm warm-tinted expand still works.
- **Project pages** — click each of the 11 project pages (route list in Task 8 Step 4), confirm no white-on-white, no blue accents.
- **Resize** — drag the browser window, confirm three.js renderer resizes.
- **Mobile width** — narrow the window below 768 px, confirm layout doesn't break.

Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add -u portfolio-website/public/assets/
git commit -m "$(cat <<'EOF'
chore(portfolio): drop unused space.jpeg + space-arp audio

Both replaced by the new orchard scene (programmatic gradient
background) and crickets-dusk.ogg ambient audio.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Final status check**

```bash
git status
git log --oneline feat/portfolio-nature-retheme ^main
```

Expected:
- Working tree clean (no uncommitted changes apart from `.claude/settings.local.json` if still present).
- 10 commits on the branch ahead of main (1 spec + 9 implementation).

The plan is complete. The implementing agent should pause and ask whether to push the branch and open a PR, or stay local for further iteration.
