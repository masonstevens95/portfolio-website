export function simplifyPath(
  points: { x: number; y: number }[],
  tolerance: number
): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance * tolerance;

  function getSqDist(p1: any, p2: any) {
    const dx = p1.x - p2.x,
      dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }

  function getSqSegDist(p: any, p1: any, p2: any) {
    let x = p1.x,
      y = p1.y;
    let dx = p2.x - x,
      dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {
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
  }

  function simplifyDP(
    points: any[],
    first: number,
    last: number,
    sqTolerance: number,
    out: any[]
  ) {
    let maxSqDist = sqTolerance;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) simplifyDP(points, first, index, sqTolerance, out);
      out.push(points[index]);
      if (last - index > 1) simplifyDP(points, index, last, sqTolerance, out);
    }
  }

  const out = [points[0]];
  simplifyDP(points, 0, points.length - 1, sqTolerance, out);
  out.push(points[points.length - 1]);
  return out;
}
