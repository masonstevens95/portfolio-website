// utils/outline.ts
export type Point = { x: number; y: number };

/** Make a 0/1 binary map from ImageData (expects edges in the R/G/B channels) */
export function toBinary(image: ImageData, threshold = 128): Uint8Array {
  const { data, width, height } = image;
  const out = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    // image may be grayscale in RGB channels; use R
    const v = data[i * 4]; // 0..255
    out[i] = v >= threshold ? 1 : 0;
  }
  return out;
}

/**
 * Marching Squares that RETURNS LINKED CONTOUR POLYLINES.
 * We quantize the “half-cell” coordinates by *2 so edges meet perfectly on integer grid,
 * then walk the adjacency graph to stitch continuous paths.
 */
export function marchingSquaresLinked(
  binary: Uint8Array,
  width: number,
  height: number
): Point[][] {
  // helper to read binary map
  const at = (x: number, y: number) =>
    x < 0 || x >= width || y < 0 || y >= height ? 0 : binary[y * width + x];

  // adjacency graph on a 2x grid (so 0.5 steps become integers)
  // key = `${X},${Y}` in this 2x grid
  const adj = new Map<string, Set<string>>();

  // add undirected edge
  const link = (ax: number, ay: number, bx: number, by: number) => {
    const a = `${ax},${ay}`;
    const b = `${bx},${by}`;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };

  // for each cell, add its segment(s)
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);

      const code = (tl << 3) | (tr << 2) | (br << 1) | bl;

      // midpoints in cell (x..x+1, y..y+1), quantized by *2
      const Lx = x * 2,
        Ly = y * 2 + 1;
      const Rx = x * 2 + 2,
        Ry = y * 2 + 1;
      const Tx = x * 2 + 1,
        Ty = y * 2;
      const Bx = x * 2 + 1,
        By = y * 2 + 2;

      // cases (dual of standard table, using 0/1 as inside/outside)
      switch (code) {
        case 0:
        case 15:
          // no edge
          break;
        case 1: // 0001 (bl)
          link(Lx, Ly, Bx, By);
          break;
        case 2: // 0010 (br)
          link(Bx, By, Rx, Ry);
          break;
        case 3: // 0011 (br,bl)
          link(Lx, Ly, Rx, Ry);
          break;
        case 4: // 0100 (tr)
          link(Tx, Ty, Rx, Ry);
          break;
        case 5: // 0101 (tr,bl) — ambiguous; split into two segments
          link(Tx, Ty, Lx, Ly);
          link(Bx, By, Rx, Ry);
          break;
        case 6: // 0110 (tr,br)
          link(Tx, Ty, Bx, By);
          break;
        case 7: // 0111 (tr,br,bl)
          link(Tx, Ty, Lx, Ly);
          break;
        case 8: // 1000 (tl)
          link(Lx, Ly, Tx, Ty);
          break;
        case 9: // 1001 (tl,bl)
          link(Tx, Ty, Bx, By);
          break;
        case 10: // 1010 (tl,br) — ambiguous; split into two segments
          link(Lx, Ly, Rx, Ry);
          link(Tx, Ty, Bx, By);
          break;
        case 11: // 1011 (tl,br,bl)
          link(Tx, Ty, Rx, Ry);
          break;
        case 12: // 1100 (tl,tr)
          link(Lx, Ly, Rx, Ry);
          break;
        case 13: // 1101 (tl,tr,bl)
          link(Bx, By, Rx, Ry);
          break;
        case 14: // 1110 (tl,tr,br)
          link(Lx, Ly, Bx, By);
          break;
      }
    }
  }

  // walk adjacency graph to get polylines
  const paths: Point[][] = [];
  const visitedEdge = new Set<string>();

  const popFromSet = (s: Set<string>) => {
    const v = s.values().next().value as string | undefined;
    if (v !== undefined) s.delete(v);
    return v;
  };

  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  for (const start of adj.keys()) {
    // while this node still has unused neighbors, start a new path
    while (adj.get(start)?.size) {
      let curr = start;
      let prev: string | null = null;
      const pathKeys: string[] = [curr];

      while (true) {
        const neighbors = adj.get(curr);
        if (!neighbors || neighbors.size === 0) break;

        // pick a neighbor that doesn't consume a visited edge yet
        let next: string | undefined;
        for (const cand of neighbors) {
          const ek = edgeKey(curr, cand);
          if (!visitedEdge.has(ek)) {
            next = cand;
            visitedEdge.add(ek);
            // remove this undirected edge from both sides
            neighbors.delete(cand);
            adj.get(cand)?.delete(curr);
            break;
          } else {
            // already used this edge; skip it
            neighbors.delete(cand);
            adj.get(cand)?.delete(curr);
          }
        }
        if (!next) break;

        // walk
        prev = curr;
        curr = next;
        pathKeys.push(curr);

        // if we returned to start, the loop is closed
        if (curr === start) break;
      }

      if (pathKeys.length > 1) {
        // convert 2x-grid integer coords → original float coords (divide by 2)
        const poly: Point[] = pathKeys.map((k) => {
          const [X, Y] = k.split(",").map((n) => parseInt(n, 10));
          return { x: X / 2, y: Y / 2 };
        });
        paths.push(poly);
      }
    }
  }

  return paths;
}

/** Douglas–Peucker simplification */
export function simplifyPath(points: Point[], tolerance = 2): Point[] {
  if (points.length <= 2) return points;
  const sqTol = tolerance * tolerance;

  const sqSegDist = (p: Point, a: Point, b: Point) => {
    let x = a.x,
      y = a.y;
    let dx = b.x - x,
      dy = b.y - y;
    if (dx || dy) {
      let t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      t = Math.max(0, Math.min(1, t));
      x = x + dx * t;
      y = y + dy * t;
    }
    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  };

  const out = [points[0]];
  (function dp(first: number, last: number) {
    let index = -1,
      maxDist = 0;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxDist) {
        index = i;
        maxDist = d;
      }
    }
    if (maxDist > sqTol && index !== -1) {
      dp(first, index);
      out.push(points[index]);
      dp(index, last);
    }
  })(0, points.length - 1);
  out.push(points[points.length - 1]);
  return out;
}

export function pickLargestContour(paths: Point[][]): Point[] {
  return paths.reduce(
    (best, cur) => (cur.length > best.length ? cur : best),
    [] as Point[]
  );
}
