import { HeaderSelected } from "../redux/slices/globalData";
import type { ParallaxProps } from "./types/ParallaxProps";

// Map header enum to parallax page offsets
export const headerToPageMap: Record<HeaderSelected, ParallaxProps> = {
  [HeaderSelected.WELCOME]: {
    offset: 0,
    speed: 2,
    factor: 0.99,
  },
  [HeaderSelected.ABOUT_ME]: {
    offset: 0.99,
    speed: 4,
    factor: 0.75,
  },
  [HeaderSelected.FEATURED_WORK]: {
    offset: 1,
    speed: 2,
    factor: 0.99,
  },
  [HeaderSelected.PROFESSIONAL_GOALS]: {
    offset: 2,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.CONTACT]: {
    offset: 3,
    speed: 1,
    factor: 0.99,
  },
};
