/*
  InfiniteScrollContainer
*/

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Parallax } from "@react-spring/parallax";
import { useParallaxScroll } from "../utils/hooks/useParallaxScroll";
import { WelcomeBlock } from "./WelcomeBlock";
import { useAppDispatch, useAppSelector } from "../utils/hooks/reduxHooks";
import { HeaderSelected, setHeaderSelected } from "../redux/slices/globalData";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
import { AboutMeBlock } from "./AboutMeBlock";
import { ProfessionalGoalsBlock } from "./ProfessionalGoalsBlock";
import { ContactBlock } from "./ContactBlock";
// import { LoginButton } from "../Login/LoginButton";
// import { useRouter } from "next/navigation";

interface ParallaxProps {
  offset: number;
  speed: number;
  factor: number;
}

interface Props {}

export const InfiniteScrollContainer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef(null);
  const dispatch = useAppDispatch();
  const [pageScrolledTime, setPageScrolledToTime] = useState<Date>(new Date());
  // const parallaxRef = useRef<RefObject<IParallax>>();

  // Get selected header from Redux
  const headerSelected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  // Map header enum to parallax page offsets
  const headerToPageMap: Record<HeaderSelected, ParallaxProps> = {
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

  // Scroll parallax when headerSelected changes
  useEffect(() => {
    if (parallaxRef.current) {
      const page = headerToPageMap[headerSelected].offset;
      parallaxRef.current.scrollTo(page);
      setPageScrolledToTime(new Date());
    }
  }, [headerSelected]);

  let scroll = useParallaxScroll();

  const [camera, setCamera] = useState<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );

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
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.setZ(50);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    const spaceTexture = new THREE.TextureLoader().load("/assets/space.jpeg");
    spaceTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = spaceTexture;

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const lightHelper = new THREE.PointLightHelper(pointLight);
    scene.add(lightHelper);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      antialias: true, // Optional, for smoother edges
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);

    function addStar() {
      const geometry = new THREE.SphereGeometry(0.25, 24, 24);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3)
        .fill(0)
        .map(() => THREE.MathUtils.randFloatSpread(100));

      star.position.set(x, y, z);
      scene.add(star);
    }

    Array(200).fill(0).forEach(addStar);

    scene.add(earth);
    earth.position.setX(-75);

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    // Animation loop or initial render
    const animate = () => {
      // console.log('animating...')
      requestAnimationFrame(animate);
      // Update objects' states here
      earth.rotation.y += 0.0005;

      controls.update();

      renderer.render(scene, camera);
    };
    animate();

    // Optional: Resize listener for responsive canvas
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log("scroll in page", scroll);

    const rightNow = new Date();

    console.log(
      "rightNow.getTime() - pageScrolledTime.getTime()",
      rightNow.getTime() - pageScrolledTime.getTime()
    );

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
      // console.log('scrollPos', scrollPos)
      const t = document.body.getBoundingClientRect().top;
      console.log("rerender");
      if (scroll == 0) {
        rotateToZero();
        earth.rotation.y += 0.0005;
      }

      if (
        scroll > headerToPageMap[HeaderSelected.WELCOME].offset &&
        scroll < headerToPageMap[HeaderSelected.FEATURED_WORK].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 2000) {
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
        scroll > headerToPageMap[HeaderSelected.FEATURED_WORK].offset &&
        scroll < headerToPageMap[HeaderSelected.ABOUT_ME].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 2000) {
          dispatch(setHeaderSelected(HeaderSelected.FEATURED_WORK));
        }
      } else if (
        scroll > headerToPageMap[HeaderSelected.ABOUT_ME].offset &&
        scroll < headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 2000) {
          dispatch(setHeaderSelected(HeaderSelected.ABOUT_ME));
        }
      } else if (
        scroll > headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS].offset &&
        scroll < headerToPageMap[HeaderSelected.CONTACT].offset
      ) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 2000) {
          dispatch(setHeaderSelected(HeaderSelected.PROFESSIONAL_GOALS));
        }
      } else if (scroll > headerToPageMap[HeaderSelected.CONTACT].offset) {
        if (rightNow.getTime() - pageScrolledTime.getTime() > 2000) {
          dispatch(setHeaderSelected(HeaderSelected.CONTACT));
        }
      }
    }
    moveCamera(scroll);
  }, [scroll]);

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
        <Parallax className="parallax" pages={5} ref={parallaxRef}>
          <WelcomeBlock {...headerToPageMap[HeaderSelected.WELCOME]} />

          <FeaturedWorkBlock
            {...headerToPageMap[HeaderSelected.FEATURED_WORK]}
          />

          <AboutMeBlock {...headerToPageMap[HeaderSelected.ABOUT_ME]} />

          <ProfessionalGoalsBlock
            {...headerToPageMap[HeaderSelected.PROFESSIONAL_GOALS]}
          />

          <ContactBlock {...headerToPageMap[HeaderSelected.CONTACT]} />
        </Parallax>
      </div>
    </div>
  );
};
