import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const useThreeSceneMount = (canvasRef, earth) => {
  //const [x, setX] = useState(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
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
      requestAnimationFrame(animate);

      // spin
      earth.rotation.y += 0.0005;

      // scroll-based movement
      const scrollTop = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = scrollTop / maxScroll;
      const startMove = 0.9;
      let t = (progress - startMove) / (1 - startMove);
      t = THREE.MathUtils.clamp(t, 0, 1);
      const startX = -75;
      const endX = 400; // adjust if planet doesn’t fully leave screen
      earth.position.x = THREE.MathUtils.lerp(startX, endX, t);
  
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

  //return scroll;
};
