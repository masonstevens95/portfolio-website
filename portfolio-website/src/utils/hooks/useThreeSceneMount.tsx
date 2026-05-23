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
// With 4-page parallax (scroll 0..~3) and stages stacked at Y=0/-80/-160, a
// multiplier of 50 gives offsets 0→~150, which puts the underground center
// within the visible viewport by scroll≈3. Earlier value (SPREAD_Y/2 = 40)
// only reached offset 120, leaving the underground stage half-visible at
// the page bottom.
const STAGE_SCROLL_MULTIPLIER = 50;

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
// Backdrop (the world-space gradient plane that translates with scroll)
// =============================================================================
// scene.background is a screen-space fill in three.js — it doesn't translate
// with world objects. To make the gradient appear to scroll downward as the
// camera "descends," render it as a large PlaneGeometry positioned far back
// in z, and translate it together with the stage groups in applyScrollAndMouse.

interface Backdrop {
  mesh: THREE.Mesh;
  texture: THREE.CanvasTexture;
}

const BACKDROP_WIDTH = 500;            // wide enough to fill the viewport at ultrawide aspect ratios (≥21:9)
const BACKDROP_HEIGHT = SPREAD_Y * 4;  // 320 — spans more than the 3-stage extent so we never see past the edges
const BACKDROP_Z = -80;                // behind everything (fireflies are at z >= -40)
// Center the backdrop vertically across the three stages so it covers them all:
// stages are at Y = 0, -80, -160; midpoint is -80.
const BACKDROP_CENTER_Y = (SKY_CENTER_Y + UNDERGROUND_CENTER_Y) / 2;

const buildBackdrop = (): Backdrop => {
  const texture = buildVerticalGradientTexture();
  const geometry = new THREE.PlaneGeometry(BACKDROP_WIDTH, BACKDROP_HEIGHT);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, BACKDROP_CENTER_Y, BACKDROP_Z);
  return { mesh, texture };
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
  // Sit the ridge near the bottom edge of the sky stage's visible extent so
  // at scroll=0 it just peeks into the lower part of the frame, then rises
  // into prominence as the camera approaches the sky→forest boundary.
  ridgeMesh.position.set(0, -SPREAD_Y * 0.7, -20);
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
  fungi: { points: THREE.Points };
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

  // Fungi point sprites — scattered through the soil region.
  // All fungi twinkle in unison via a global material-opacity sine in
  // animate(), so per-point phases aren't needed.
  const fungiTex = buildFungiGlowTexture();
  const positions = new Float32Array(FUNGI_COUNT * 3);
  for (let i = 0; i < FUNGI_COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y * 0.7 - SPREAD_Y * 0.05;
    positions[i * 3 + 2] = -15 + Math.random() * 25;
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
    fungi: { points: fungiPoints },
    fungiTex,
    rootsMesh,
    rootsTex,
    worms,
    wormTex,
    beetles,
    beetleTex,
  };
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
    // No scene.background — the gradient is rendered as a world-space
    // PlaneGeometry (backdrop) so it can translate with scroll.

    const backdrop = buildBackdrop();
    scene.add(backdrop.mesh);

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
      backdrop.mesh.position.y = BACKDROP_CENTER_Y + offset;

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

    const twinkleStars = () => {
      const t = frame * 0.02;
      const mat = sky.starField.points.material as THREE.PointsMaterial;
      // Average twinkle by gently modulating overall opacity. Per-star twinkle
      // via attribute would be costlier and the visual difference is subtle at
      // this density. `transparent` is already true from the constructor, and
      // opacity is a uniform — no needsUpdate required.
      const base = 0.75;
      const wobble = 0.15 * Math.sin(t);
      mat.opacity = base + wobble;
    };

    const animate = () => {
      frame++;
      updateFireflyLayer(forest.far, 0.4);
      updateFireflyLayer(forest.mid, 0.7);
      updateFireflyLayer(forest.near, 1.1);
      twinkleStars();

      // Fungi twinkle — same average-opacity trick as stars
      const fungiMat = underground.fungi.points.material as THREE.PointsMaterial;
      fungiMat.opacity = 0.7 + 0.2 * Math.sin(frame * 0.025);

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
      forest.ridgeTex.dispose();
      forest.ridgeMesh.geometry.dispose();
      (forest.ridgeMesh.material as THREE.Material).dispose();
      forest.topBranchTex.dispose();
      forest.topBranchMesh.geometry.dispose();
      (forest.topBranchMesh.material as THREE.Material).dispose();
      forest.bottomBranchTex.dispose();
      forest.bottomBranchMesh.geometry.dispose();
      (forest.bottomBranchMesh.material as THREE.Material).dispose();
      forest.far.points.geometry.dispose();
      (forest.far.points.material as THREE.Material).dispose();
      forest.mid.points.geometry.dispose();
      (forest.mid.points.material as THREE.Material).dispose();
      forest.near.points.geometry.dispose();
      (forest.near.points.material as THREE.Material).dispose();
      sky.starTex.dispose();
      sky.starField.points.geometry.dispose();
      (sky.starField.points.material as THREE.Material).dispose();
      sky.moonTex.dispose();
      sky.moonMesh.geometry.dispose();
      (sky.moonMesh.material as THREE.Material).dispose();
      sky.ridgeTex.dispose();
      sky.ridgeMesh.geometry.dispose();
      (sky.ridgeMesh.material as THREE.Material).dispose();
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
      backdrop.texture.dispose();
      backdrop.mesh.geometry.dispose();
      (backdrop.mesh.material as THREE.Material).dispose();
      disposeRendererForStrictModeSafety(renderer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
