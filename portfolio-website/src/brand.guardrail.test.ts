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
// index.html is where the display face is loaded, so it is where the
// "no editorial serifs" decision would actually regress. It sits outside
// src/, so scan it explicitly.
const EXTRA_FILES = [join(SRC, "..", "index.html")];

/**
 * Blank out comment bodies before matching.
 *
 * The patterns below are ordinary English words, so a comment accurately
 * describing what was removed ("the card used a rounded corner and a shadow")
 * would fail the build. That is not hypothetical — it silently mangled two
 * comments before this was added. Code is checked; prose about code is not.
 */
const stripComments = (source: string): string[] => {
  let inBlock = false;

  return source.split("\n").map((line) => {
    let out = "";
    let quote: string | null = null;
    let i = 0;

    while (i < line.length) {
      const ch = line[i];

      if (inBlock) {
        const close = line.indexOf("*/", i);
        if (close === -1) return out;
        inBlock = false;
        i = close + 2;
        continue;
      }

      // Inside a string literal nothing is a comment. This matters: without
      // it, the "//" in "https://..." reads as a line comment and truncates
      // the URL, which hid a real Fraunces font link from the check.
      if (quote) {
        out += ch;
        if (ch === "\\") {
          out += line[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (ch === quote) quote = null;
        i += 1;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        out += ch;
        i += 1;
        continue;
      }

      if (line.startsWith("/*", i)) {
        inBlock = true;
        i += 2;
        continue;
      }
      if (line.startsWith("//", i)) return out;
      if (line.startsWith("<!--", i)) return out;

      out += ch;
      i += 1;
    }

    return out;
  });
};

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
  // Each of the three below matches both the kebab-case CSS/Tailwind spelling
  // and the camelCase inline-style spelling. The site leans heavily on
  // style={{...}}, so a kebab-only pattern would let a shadow back in through
  // the dominant convention.
  {
    label: "shadow (no drop shadows)",
    pattern:
      /\bbox-shadow\b|\bdrop-shadow\b|\bshadow-(?:sm|md|lg|xl|2xl|inner)\b|\[text-shadow:|\bboxShadow\b|\btextShadow\b|\bfilter:\s*["'`]?drop-shadow/,
  },
  {
    label: "backdrop blur (frosted surfaces are not printed)",
    pattern: /\bbackdrop-blur\b|\bbackdropFilter\b|\bWebkitBackdropFilter\b/,
  },
  {
    label: "border radius (a printed rule has square corners)",
    pattern:
      /\brounded(?:-(?:sm|md|lg|xl|2xl|3xl|full|t|b|l|r))?\b|\bborder-radius\b|\bborderRadius\b/,
  },
  {
    // brand-kit.md, "On screen": a 4px border on a web page is a plan-sheet
    // mark applied at the wrong scale. Frames go through .ink-frame, which is
    // driven by --rule-heavy, so there is no reason to hand-write one.
    label: "heavy frame (frames are hairlines, never filled boxes)",
    pattern: /(?:[3-9]|\d\d)px\s+solid|border(?:-\w+)?-(?:[3-9]|\d\d)\b/,
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
  // Read every file once and share the lines across all patterns, rather than
  // re-reading the tree per prohibition.
  const files = [...walk(SRC).filter((f) => /\.(tsx?|css)$/.test(f)), ...EXTRA_FILES]
    .map((file) => ({
      rel: relative(SRC, file).split("\\").join("/"),
      // Keep the raw line for the failure message; match against the
      // comment-stripped one so accurate prose does not fail the build.
      raw: readFileSync(file, "utf8").split("\n"),
      lines: stripComments(readFileSync(file, "utf8")),
    }))
    .filter(({ rel }) => !ALLOWED[rel]);

  it("finds source files to check", () => {
    // Guards against the walk silently matching nothing, which would make
    // every assertion below vacuously pass.
    expect(files.length).toBeGreaterThan(30);
  });

  for (const { label, pattern } of FORBIDDEN) {
    it(`has no ${label}`, () => {
      const offenders: string[] = [];

      for (const { rel, raw, lines } of files) {
        lines.forEach((line, i) => {
          if (pattern.test(line)) {
            offenders.push(`${rel}:${i + 1}  ${raw[i].trim()}`);
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
