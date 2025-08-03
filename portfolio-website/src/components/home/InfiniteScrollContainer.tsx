/*
  InfiniteScrollContainer
*/

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Parallax } from "@react-spring/parallax";
import { useParallaxScroll } from "../../utils/hooks/useParallaxScroll";
import { WelcomeBlock } from "./WelcomeBlock";
import { useAppDispatch, useAppSelector } from "../../utils/hooks/reduxHooks";
import { HeaderSelected } from "../../redux/slices/globalData";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
import { AboutMeBlock } from "./AboutMeBlock";
import { ProfessionalGoalsBlock } from "./ProfessionalGoalsBlock";
import { ContactBlock } from "./ContactBlock";
import { useScrollListen } from "../../utils/hooks/useScrollListen";
import { headerToPageMap } from "../../utils/headerToPageMap";
import { useHeaderSelectionListener } from "../../utils/hooks/useHeaderSelectionListener";
import { useThreeSceneMount } from "../../utils/hooks/useThreeSceneMount";

interface Props {}

export const InfiniteScrollContainer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);
  // const parallaxRef = useRef<RefObject<IParallax>>();

  // Get selected header from Redux
  const headerSelected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  // region custom hooks
  const pageScrolledTime = useHeaderSelectionListener(
    parallaxRef,
    headerSelected
  );
  let scroll = useParallaxScroll();
  const earth = useScrollListen(scroll, pageScrolledTime);
  useThreeSceneMount(canvasRef, earth);

  //endregion
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );

  //todo - add some ambient noise

  return (
    // <div className="bg-slate-100 h-full w-full space-x-0.5 space-y-1 p-1 flex flex-col overflow-y-auto">
    <div className="left-0 top-0 fixed w-full h-full items-right">
      <canvas
        ref={canvasRef}
        id="bg"
        className="fixed top-0 left-0 w-full h-full"
      />
      {/* <canvas ref={canvasRef} id="bg" className="" /> */}

      <div className="left-0 top-0 fixed z-1 w-full h-full">
        <Parallax className="parallax" pages={4} ref={parallaxRef}>
          <WelcomeBlock {...headerToPageMap[HeaderSelected.WELCOME]} />

          <AboutMeBlock {...headerToPageMap[HeaderSelected.ABOUT_ME]} />

          <FeaturedWorkBlock
            {...headerToPageMap[HeaderSelected.FEATURED_WORK]}
          />

          <ProfessionalGoalsBlock
            {...headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS]}
          />

          <ContactBlock {...headerToPageMap[HeaderSelected.CONTACT]} />
        </Parallax>
      </div>
    </div>
  );
};
