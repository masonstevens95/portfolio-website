// utils/image/findNearestNeighborPath.ts
export type Point = { x: number; y: number };

export const findNearestNeighborPath = (
  imageData: ImageData,
  blackThreshold: number = 50,
  sampleStep: number = 3 // skip every N pixels for speed
): Point[] => {
  const { data, width, height } = imageData;
  const points: Point[] = [];

  // Step 1: Collect points with downsampling
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const brightness = data[idx]; // grayscale image: r = g = b
      if (brightness < blackThreshold) {
        points.push({ x, y });
      }
    }
  }

  if (points.length === 0) return [];

  // Step 2: Use a visited array instead of splicing
  const visited = new Uint8Array(points.length);
  const path: Point[] = [];

  let currentIdx = 0;
  let current = points[currentIdx];
  visited[currentIdx] = 1;
  path.push(current);

  for (let step = 1; step < points.length; step++) {
    let closestIdx = -1;
    let minDistSq = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (visited[i]) continue;
      const d = distanceSq(current, points[i]);
      if (d < minDistSq) {
        minDistSq = d;
        closestIdx = i;
      }
    }

    if (closestIdx === -1) break;

    current = points[closestIdx];
    visited[closestIdx] = 1;
    path.push(current);
  }

  return path;
};

const distanceSq = (a: Point, b: Point): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
