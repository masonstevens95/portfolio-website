// utils/marchingSquares.ts
export function traceContour(
  imageData: ImageData,
  threshold = 128,
  maxSteps = 100000
): { x: number; y: number }[] {
  const { data, width, height } = imageData;

  const isEdge = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 4;
    return data[idx] > threshold; // grayscale assumption
  };

  // find start pixel
  let startX = -1,
    startY = -1;
  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isEdge(x, y)) {
        startX = x;
        startY = y;
        break outer;
      }
    }
  }
  if (startX === -1) return [];

  const path: { x: number; y: number }[] = [];
  const visited = new Set<string>();
  let cx = startX,
    cy = startY;

  // 4-connected neighborhood
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  let steps = 0;
  do {
    path.push({ x: cx, y: cy });
    visited.add(`${cx},${cy}`);

    let moved = false;
    for (let i = 0; i < 4; i++) {
      const [dx, dy] = dirs[i];
      const nx = cx + dx,
        ny = cy + dy;
      if (isEdge(nx, ny) && !visited.has(`${nx},${ny}`)) {
        cx = nx;
        cy = ny;
        moved = true;
        break;
      }
    }

    steps++;
    if (!moved || steps > maxSteps) break;
  } while (!(cx === startX && cy === startY));

  return path;
}
