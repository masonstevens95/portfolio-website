/*
  InfiniteScrollContainer
*/

import { useEffect, useRef } from "react";
import { Parallax } from "@react-spring/parallax";
import { WelcomeBlock } from "./WelcomeBlock";
import { useAppSelector } from "../../utils/hooks/reduxHooks";
import { HeaderSelected } from "../../redux/slices/globalData";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
import { AboutMeBlock } from "./AboutMeBlock";
import { ContactBlock } from "./ContactBlock";
import { useScrollListen } from "../../utils/hooks/useScrollListen";
import { headerToPageMap } from "../../utils/headerToPageMap";
import { useHeaderSelectionListener } from "../../utils/hooks/useHeaderSelectionListener";
import { useThreeSceneMount } from "../../utils/hooks/useThreeSceneMount";
import { useMouseParallax } from "../../utils/hooks/useMouseParallax";

interface Props {
  scroll: number;
}

export const InfiniteScrollContainer = ({ scroll }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);

  const headerSelected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  const pageScrolledTime = useHeaderSelectionListener(
    parallaxRef,
    headerSelected
  );

  const scrollRef = useRef(scroll);
  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);

  useScrollListen(scroll, pageScrolledTime);
  const mouseRef = useMouseParallax();
  useThreeSceneMount(canvasRef, scrollRef, mouseRef);

  return (
    <div className="left-0 top-0 fixed w-full h-full items-right">
      <canvas
        ref={canvasRef}
        id="bg"
        className="fixed top-0 left-0 w-full h-full"
      />

      <div className="left-0 top-0 fixed z-1 w-full h-full">
        <Parallax className="parallax" pages={4} ref={parallaxRef}>
          <WelcomeBlock {...headerToPageMap[HeaderSelected.WELCOME]} />
          <AboutMeBlock {...headerToPageMap[HeaderSelected.ABOUT_ME]} />
          <FeaturedWorkBlock
            {...headerToPageMap[HeaderSelected.FEATURED_WORK]}
          />
          <ContactBlock {...headerToPageMap[HeaderSelected.CONTACT]} />
        </Parallax>
      </div>
    </div>
  );
};
