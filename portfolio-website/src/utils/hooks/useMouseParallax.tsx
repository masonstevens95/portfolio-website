import { useEffect, useRef } from "react";

export interface MouseParallaxOffset {
  x: number; // -0.5 .. 0.5
  y: number; // -0.5 .. 0.5
}

export const normalizeMousePosition = (
  clientX: number,
  clientY: number,
  width: number,
  height: number
): MouseParallaxOffset => ({
  x: clientX / width - 0.5,
  y: clientY / height - 0.5,
});

export const useMouseParallax = () => {
  const ref = useRef<MouseParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current = normalizeMousePosition(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return ref;
};
