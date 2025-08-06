// utils/image/findNearestNeighborPath.ts

export type Point = { x: number; y: number };

export const findNearestNeighborPath = (
  imageData: ImageData,
  blackThreshold: number = 50
): Point[] => {
  const { data, width, height } = imageData;
  const points: Point[] = [];

  // Step 1: Collect all "black" pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const brightness = data[idx]; // Grayscale: R = G = B
      if (brightness < blackThreshold) {
        points.push({ x, y });
      }
    }
  }

  if (points.length === 0) return [];

  // Step 2: Walk the points in nearest-neighbor order
  const path: Point[] = [];
  let current = points.shift()!;
  path.push(current);

  while (points.length > 0) {
    let closestIdx = 0;
    let minDistSq = distanceSq(current, points[0]);

    for (let i = 1; i < points.length; i++) {
      const d = distanceSq(current, points[i]);
      if (d < minDistSq) {
        minDistSq = d;
        closestIdx = i;
      }
    }

    current = points.splice(closestIdx, 1)[0];
    path.push(current);
  }

  return path;
};

const distanceSq = (a: Point, b: Point): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
