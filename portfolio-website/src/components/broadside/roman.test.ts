import { describe, it, expect } from "vitest";
import { toRoman } from "./roman";

describe("toRoman", () => {
  it("formats plate and catalog numbers", () => {
    expect([1, 2, 4, 9, 12, 13, 14, 40, 99].map(toRoman)).toEqual([
      "I", "II", "IV", "IX", "XII", "XIII", "XIV", "XL", "XCIX",
    ]);
  });
});
