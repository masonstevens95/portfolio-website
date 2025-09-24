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

    function moveCamera(scroll: number) {
      const t = document.body.getBoundingClientRect().top;
      if (scroll == 0) {
        rotateToZero();
        earth.rotation.y += 0.0005;
      }

      if (
        scroll >= headerToPageMap[HeaderSelected.WELCOME].offset &&
        scroll < headerToPageMap[HeaderSelected.FEATURED_WORK].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 1400) {
          dispatch(setHeaderSelected(HeaderSelected.WELCOME));
        }

        const newScroll = scroll * 1;
        // earth.rotation.x += 0.005 * newScroll;
        earth.rotation.y += 0.03 * newScroll;
        // earth.rotation.z += 0.005 * newScroll;

        earth.position.x = -75 + 148 * newScroll;

        // camera.position.z = 50 + -250 * newScroll;
        // camera.position.x = 100 * newScroll;
        // camera.position.y = -0.0002 * newScroll;
      } else if (
        scroll >= headerToPageMap[HeaderSelected.ABOUT_ME].offset &&
        scroll < headerToPageMap[HeaderSelected.FEATURED_WORK].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 1400) {
          dispatch(setHeaderSelected(HeaderSelected.ABOUT_ME));
        }
      } else if (
        scroll >= headerToPageMap[HeaderSelected.FEATURED_WORK].offset &&
        scroll < headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 1400) {
          dispatch(setHeaderSelected(HeaderSelected.ABOUT_ME));
        }
      } else if (
        scroll >= headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS].offset &&
        scroll < headerToPageMap[HeaderSelected.CONTACT].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 1400) {
          dispatch(setHeaderSelected(HeaderSelected.PROFESSIONAL_GOALS));
        }
      } else if (scroll > headerToPageMap[HeaderSelected.CONTACT].offset) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 1400) {
          dispatch(setHeaderSelected(HeaderSelected.CONTACT));
        }
      }
    }
    moveCamera(scroll);
  }, [scroll]);

  return earth;
};
