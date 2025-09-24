import React, { useEffect, useState } from "react";
import { headerToPageMap } from "../headerToPageMap";

export const useHeaderSelectionListener = (parallaxRef, headerSelected) => {
  const [pageScrolledTime, setPageScrolledToTime] = useState<Date>(new Date());

  // Scroll parallax when headerSelected changes
  useEffect(() => {
    // if (parallaxRef.current) {
    //   const page = headerToPageMap[headerSelected].offset;
    //   console.log("page scroll", page);
    //   parallaxRef.current.scrollTo(page);
    //   setPageScrolledToTime(new Date());
    // }

    if (!parallaxRef.current) return;
    console.log("Scrolling to:", headerToPageMap[headerSelected].offset);

    const { offset } = headerToPageMap[headerSelected];
    parallaxRef.current.scrollTo(offset); // offset can be fractional
    setPageScrolledToTime(new Date());
  }, [headerSelected]);

  return pageScrolledTime;
};
