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
