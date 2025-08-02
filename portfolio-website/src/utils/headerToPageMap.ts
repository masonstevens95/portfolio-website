import { HeaderSelected } from "../redux/slices/globalData";
import type { ParallaxProps } from "./types/ParallaxProps";

// Map header enum to parallax page offsets
export const headerToPageMap: Record<HeaderSelected, ParallaxProps> = {
  [HeaderSelected.WELCOME]: {
    offset: 0,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.FEATURED_WORK]: {
    offset: 1,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.ABOUT_ME]: {
    offset: 2,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.PROFESSIONAL_GOALS]: {
    offset: 3,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.CONTACT]: {
    offset: 4,
    speed: 1,
    factor: 0.99,
  },
};
