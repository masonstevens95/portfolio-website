// utils/contourUtils.ts
export type Point = { x: number; y: number };

// ---- Marching Squares ----
export function marchingSquares(
  imageData: ImageData,
  threshold = 128
): Point[][] {
  const { width, height, data } = imageData;
  const getPixel = (x: number, y: number) =>
    data[(y * width + x) * 4] < threshold ? 1 : 0; // use red channel only (grayscale assumed)

  const paths: Point[][] = [];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const square =
        (getPixel(x, y) << 3) |
        (getPixel(x + 1, y) << 2) |
        (getPixel(x + 1, y + 1) << 1) |
        (getPixel(x, y + 1) << 0);

      const edges = marchingSquaresTable[square];
      if (edges) {
        const path: Point[] = edges.map(([ex, ey]) => ({
          x: x + ex,
          y: y + ey,
        }));
        paths.push(path);
      }
    }
  }
  return paths;
}

const marchingSquaresTable: Record<number, [number, number][]> = {
  1: [
    [0, 0.5],
    [0.5, 1],
  ],
  2: [
    [0.5, 1],
    [1, 0.5],
  ],
  3: [
    [0, 0.5],
    [1, 0.5],
  ],
  4: [
    [0.5, 0],
    [1, 0.5],
  ],
  5: [
    [0, 0.5],
    [0.5, 0],
    [0.5, 1],
    [1, 0.5],
  ],
  6: [
    [0.5, 0],
    [0.5, 1],
  ],
  7: [
    [0, 0.5],
    [0.5, 0],
  ],
  8: [
    [0.5, 0],
    [0, 0.5],
  ],
  9: [
    [0.5, 0],
    [0.5, 1],
  ],
  10: [
    [0.5, 0],
    [1, 0.5],
    [0, 0.5],
    [0.5, 1],
  ],
  11: [
    [0.5, 0],
    [1, 0.5],
  ],
  12: [
    [1, 0.5],
    [0, 0.5],
  ],
  13: [
    [0.5, 1],
    [1, 0.5],
  ],
  14: [
    [0, 0.5],
    [0.5, 1],
  ],
};

// ---- Path Simplification ----
export function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;
  const sqTol = tolerance * tolerance;

  const sqDist = (p1: Point, p2: Point) => {
    const dx = p1.x - p2.x,
      dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  };
  const sqSegDist = (p: Point, p1: Point, p2: Point) => {
    let x = p1.x,
      y = p1.y;
    let dx = p2.x - x,
      dy = p2.y - y;
    if (dx || dy) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  };

  function dp(
    points: Point[],
    first: number,
    last: number,
    sqTol: number,
    out: Point[]
  ) {
    let maxSqDist = sqTol,
      index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxSqDist) {
        index = i;
        maxSqDist = d;
      }
    }
    if (maxSqDist > sqTol) {
      if (index - first > 1) dp(points, first, index, sqTol, out);
      out.push(points[index]);
      if (last - index > 1) dp(points, index, last, sqTol, out);
    }
  }

  const out = [points[0]];
  dp(points, 0, points.length - 1, sqTol, out);
  out.push(points[points.length - 1]);
  return out;
}

// ---- Largest Path ----
export function pickLargestContour(paths: Point[][]): Point[] {
  return paths.reduce(
    (largest, current) => (current.length > largest.length ? current : largest),
    [] as Point[]
  );
}
