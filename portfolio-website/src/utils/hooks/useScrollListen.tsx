import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useAppDispatch } from "./reduxHooks";
import { headerToPageMap } from "../headerToPageMap";
import {
  HeaderSelected,
  setHeaderSelected,
} from "../../redux/slices/globalData";

export const useScrollListen = (scroll, pageScrolledTime) => {
  //const [x, setX] = React.useState(0);

  const dispatch = useAppDispatch();

  const earthTexture = new THREE.TextureLoader().load(
    "/assets/earth_mercator.jpeg"
  );

  const [earth, setEarth] = useState<
    THREE.Mesh<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      THREE.Material | THREE.Material[],
      THREE.Object3DEventMap
    >
  >(
    new THREE.Mesh(
      new THREE.SphereGeometry(15, 32, 16),
      new THREE.MeshBasicMaterial({
        map: earthTexture,
      })
    )
  );

  useEffect(() => {
    // console.log("scroll", scroll);
    const rightNow = new Date();

    const rotateToZero = () => {
      let fps = 60; // fps/seconds
      let tau = 1.5; // 2 seconds
      const step = 1 / (tau * fps); // step per frame
      const finalAngle = 0.000001;
      // const finalAngle = Math.PI / 2;
      const angleStepX = -earth.rotation.x * step;
      const angleStepY = -earth.rotation.y * step;
      const angleStepZ = -earth.rotation.z * step;
      let t = 0;

      function animateGroup(t: number) {
        if (t >= 1) return; // Motion ended
        t += step; // Increment time
        earth.rotation.x += angleStepX; // Increment rotation
        earth.rotation.y += angleStepY; // Increment rotation
        earth.rotation.z += angleStepZ; // Increment rotation
        requestAnimationFrame(() => animateGroup(t));
      }

      animateGroup(t);
    };

    // Scroll-spy thresholds (start of each section as the user scrolls
    // down). Hand-tuned to feel natural with the parallax sections that
    // overlap visually — adjust constants by eye if the highlight changes
    // too early or too late at any boundary.
    const SPY_THRESHOLDS = {
      aboutMe: 0.5,
      featuredWork: 1.5,
      contact: 2.1,
    };

    function moveCamera(scroll: number) {
      if (scroll == 0) {
        rotateToZero();
        earth.rotation.y += 0.0005;
      }

      // Earth motion was originally tied to the WELCOME range; keep it
      // bound to scroll < featuredWork so the earth stops moving once
      // the Featured Work section takes over.
      if (scroll > 0 && scroll < SPY_THRESHOLDS.featuredWork) {
        earth.rotation.y += 0.03 * scroll;
        earth.position.x = -75 + 148 * scroll;
      }

      // Skip header updates while the parallax animation is still
      // mid-flight after a click-driven scrollTo (otherwise the
      // highlight flickers through the passing sections).
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
    }
    moveCamera(scroll);
  }, [scroll]);

  return earth;
};
