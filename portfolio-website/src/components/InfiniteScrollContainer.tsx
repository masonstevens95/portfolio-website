/*
  InfiniteScrollContainer
*/

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useParallaxScroll } from "../utils/hooks/useParallaxScroll";
import { WelcomeBlock } from "./WelcomeBlock";
import { useAppSelector } from "../utils/hooks/reduxHooks";
import { HeaderSelected } from "../redux/slices/globalData";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
// import { LoginButton } from "../Login/LoginButton";
// import { useRouter } from "next/navigation";

interface Props {}

export const InfiniteScrollContainer = ({}: Props) => {
  //   return <></>;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxRef = useRef();
  // const parallaxRef = useRef<RefObject<IParallax>>();

  // Get selected header from Redux
  const headerSelected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  // Map header enum to parallax page offsets
  const headerToPageMap: Record<HeaderSelected, number> = {
    [HeaderSelected.WELCOME]: 0,
    [HeaderSelected.FEATURED_WORK]: 1.25,
    [HeaderSelected.ABOUT_ME]: 1.99, // example, adjust as needed
    [HeaderSelected.PROFESSIONAL_GOALS]: 2.5,
    [HeaderSelected.CONTACT]: 3,
  };

  // Scroll parallax when headerSelected changes
  useEffect(() => {
    if (parallaxRef.current) {
      const page = headerToPageMap[headerSelected];
      parallaxRef.current.scrollTo(page);
    }
  }, [headerSelected]);

  let scroll = useParallaxScroll();
  console.log("scroll in page", scroll);

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
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      //update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
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
      if (scroll > 0 && scroll < 1.5) {
        const newScroll = scroll * 1;
        earth.rotation.x += 0.005 * newScroll;
        // earth.rotation.y += 0.0075 * newScroll;
        earth.rotation.z += 0.005 * newScroll;

        earth.position.x = -75 + 48 * newScroll;

        camera.position.z = 50 + -25 * newScroll;
        // camera.position.x = 100 * newScroll;
        // camera.position.y = -0.0002 * newScroll;
      } else {
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
        <Parallax pages={4} ref={parallaxRef}>
          <WelcomeBlock offset={0} speed={1} factor={0.99} />

          <FeaturedWorkBlock offset={1.25} speed={1.25} factor={1} />

          <ParallaxLayer
            aria-description="The design tool"
            offset={1.99}
            speed={1}
            factor={0.5}
          >
            <div className="w-3/4 h-full float-right flex flex-col items-center justify-around">
              <div>
                <h1 className="w-full text-neutral-100 text-6xl font-bold text-right space-x-14 space-y-4 p-4">
                  {" "}
                  The Design Tool{" "}
                </h1>
                <h2 className="w-full text-neutral-200 text-4xl font-bold text-right space-x-14 space-y-4 p-4">
                  {" "}
                  Let's show off some images of the design tool{" "}
                </h2>
              </div>

              <button
                className="bg-slate-100 text-neutral-800 p-1 rounded-md w-1/6 text-center"
                onClick={() => parallaxRef.current.scrollTo(0)}
              >
                Back up to login
              </button>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            aria-description="show drag and drop working"
            offset={3}
            speed={0.5}
            factor={0.25}
          >
            <div className="w-3/4 h-full float-right flex flex-col items-center justify-around">
              <div>
                <h1 className="w-full text-neutral-100 text-6xl font-bold text-right space-x-14 space-y-4 p-4">
                  {" "}
                  Drag and drop the design tool stuff with parallax or 3js{" "}
                </h1>
                <h2 className="w-full text-neutral-200 text-4xl font-bold text-right space-x-14 space-y-4 p-4">
                  {" "}
                  misc
                </h2>
              </div>
            </div>
          </ParallaxLayer>
        </Parallax>
      </div>
    </div>
  );
};
