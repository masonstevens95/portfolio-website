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
  // Task 6 will add stars, moon, distant pine ridge here.
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
