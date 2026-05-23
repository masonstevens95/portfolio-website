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
