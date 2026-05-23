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
