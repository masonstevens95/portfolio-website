import { type RefObject, useEffect } from "react";
import * as THREE from "three";
import type { MouseParallaxOffset } from "./useMouseParallax";

const FAR_COUNT = 80;
const MID_COUNT = 50;
const NEAR_COUNT = 25;
const PETAL_COUNT = 20;

const SPREAD_X = 120;
const SPREAD_Y = 80;

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

const buildBackgroundTexture = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 200, 60, 256, 280, 360);
  g.addColorStop(0.0, "#3a4a2c");
  g.addColorStop(0.5, "#2a3a22");
  g.addColorStop(1.0, "#15201a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
};

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

    // Accessibility: honor prefers-reduced-motion by rendering a single
    // static frame and skipping the animation loop entirely.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let smoothMx = 0;
    let smoothMy = 0;

    let frame = 0;
    let rafId = 0;

    const animate = () => {
      frame++;
      const t = frame * 0.01;

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

      for (const p of petals) {
        p.mesh.position.y -= p.fallSpeed;
        p.mesh.rotation.z += p.spinSpeed;
        if (p.mesh.position.y < -SPREAD_Y / 2) {
          p.mesh.position.y = SPREAD_Y / 2;
          p.mesh.position.x = (Math.random() - 0.5) * SPREAD_X;
        }
      }

      const s = scrollRef.current ?? 0;
      farGroup.position.y = -s * 1.2;
      midGroup.position.y = -s * 3.6;
      nearGroup.position.y = -s * 8.0;
      petalGroup.position.y = -s * 6.0;

      const tx = mouseRef.current?.x ?? 0;
      const ty = mouseRef.current?.y ?? 0;
      smoothMx += (tx - smoothMx) * 0.05;
      smoothMy += (ty - smoothMy) * 0.05;
      farGroup.position.x = smoothMx * 0.5;
      midGroup.position.x = smoothMx * 1.5;
      nearGroup.position.x = smoothMx * 3.0;
      petalGroup.position.x = smoothMx * 2.0;
      farGroup.position.y += smoothMy * -0.3;
      midGroup.position.y += smoothMy * -1.0;
      nearGroup.position.y += smoothMy * -2.0;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    if (prefersReducedMotion) {
      // Render one static frame and stop.
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
        renderer.render(scene, camera);
      }
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
