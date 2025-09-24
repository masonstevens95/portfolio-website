import { HeaderSelected } from "../redux/slices/globalData";
import type { ParallaxProps } from "./types/ParallaxProps";

// Map header enum to parallax page offsets
export const headerToPageMap: Record<HeaderSelected, ParallaxProps> = {
  [HeaderSelected.WELCOME]: {
    offset: 0,
    speed: 1.75,
    factor: 0.6,
  },
  [HeaderSelected.ABOUT_ME]: {
    offset: 0.05,
    speed: 2.5,
    factor: 1.25,
  },
  [HeaderSelected.FEATURED_WORK]: {
    offset: 0.99,
    speed: 0,
    factor: 0.99,
  },
  [HeaderSelected.PROFESSIONAL_GOALS]: {
    offset: 2,
    speed: 1,
    factor: 0.99,
  },
  [HeaderSelected.CONTACT]: {
    offset: 2.25,
    speed: 1.25,
    factor: 1.75,
  },
};
