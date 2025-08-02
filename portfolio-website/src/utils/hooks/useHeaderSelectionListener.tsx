import React, { useEffect, useState } from "react";
import { headerToPageMap } from "../headerToPageMap";

export const useHeaderSelectionListener = (parallaxRef, headerSelected) => {
  const [pageScrolledTime, setPageScrolledToTime] = useState<Date>(new Date());

  // Scroll parallax when headerSelected changes
  useEffect(() => {
    if (parallaxRef.current) {
      const page = headerToPageMap[headerSelected].offset;
      parallaxRef.current.scrollTo(page);
      setPageScrolledToTime(new Date());
    }
  }, [headerSelected]);

  return pageScrolledTime;
};
