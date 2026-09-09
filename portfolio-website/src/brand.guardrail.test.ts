/**
 * Brand prohibition guardrail.
 *
 * The Broadside kit's standing decisions are the kind of thing that erodes
 * one component at a time. This turns them into a build failure.
 *
 * Source of record is ~/AI-OS/brand-assets/brand-kit.md, section "Standing
 * decisions, do not relitigate":
 *
 *   - Two inks on stock. No third hue.
 *   - No gradients, no drop shadows, no editorial serifs.
 *   - Spruce is an accent. Never a large fill.
 *
 * If this test fails, the fix is the component, not the test. Changing what
 * is forbidden here is a brand decision, not a testing one.
 *
 * Deliberately literal: it greps for a short list of exact strings. A
 * guardrail that tried to parse CSS semantics would produce false positives
 * and get deleted.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, ".");

/**
 * Files allowed to contain an otherwise-forbidden string, with the reason.
 * Paths are relative to src/ and use forward slashes.
 */
const ALLOWED: Record<string, string> = {
  // The kit's own 45-degree engraving hatch is specified as a
  // repeating-linear-gradient. It is the prescribed way to fill a drawn
  // solid, not a decorative gradient.
  "styles/broadside.css": "carries the kit's engraving hatch",
  // This file names the forbidden strings in order to search for them.
  "brand.guardrail.test.ts": "is the guardrail itself",
};

const FORBIDDEN: { label: string; pattern: RegExp }[] = [
  {
    label: "orchard token (superseded palette)",
    pattern: /--orchard-/,
  },
  {
    label: "gradient (no gradients)",
    pattern: /linear-gradient|radial-gradient|conic-gradient|\bbg-gradient-to-/,
  },
  {
    label: "shadow (no drop shadows)",
    pattern: /\bbox-shadow\b|\bdrop-shadow\b|\bshadow-(?:sm|md|lg|xl|2xl|inner)\b|\[text-shadow:/,
  },
  {
    label: "backdrop blur (frosted surfaces are not printed)",
    pattern: /\bbackdrop-blur\b/,
  },
  {
    label: "border radius (a printed rule has square corners)",
    pattern: /\brounded(?:-(?:sm|md|lg|xl|2xl|3xl|full|t|b|l|r))?\b|\bborder-radius\b/,
  },
  {
    label: "superseded typeface (no editorial serifs)",
    pattern: /\bFraunces\b|\bLato\b/,
  },
  {
    label: "legacy --red token (renamed to --spruce)",
    pattern: /--red\b|--red-deep\b/,
  },
];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe("Broadside brand prohibitions", () => {
  const files = walk(SRC).filter((f) => /\.(tsx?|css)$/.test(f));

  it("finds source files to check", () => {
    // Guards against the walk silently matching nothing, which would make
    // every assertion below vacuously pass.
    expect(files.length).toBeGreaterThan(30);
  });

  for (const { label, pattern } of FORBIDDEN) {
    it(`has no ${label}`, () => {
      const offenders: string[] = [];

      for (const file of files) {
        const rel = relative(SRC, file).split("\\").join("/");
        if (ALLOWED[rel]) continue;

        readFileSync(file, "utf8")
          .split("\n")
          .forEach((line, i) => {
            if (pattern.test(line)) {
              offenders.push(`${rel}:${i + 1}  ${line.trim()}`);
            }
          });
      }

      expect(
        offenders,
        `Brand prohibition violated — ${label}.\n` +
          `See brand-kit.md "Standing decisions, do not relitigate".\n\n` +
          offenders.join("\n")
      ).toEqual([]);
    });
  }
});
