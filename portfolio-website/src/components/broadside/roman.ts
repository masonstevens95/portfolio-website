/*
  Roman numerals for PLATE and ARTICLE numbering. The kit numbers only real
  sequences (sheets, a catalog), so this only ever sees small positive
  integers, but it is correct for any 1..3999.
*/

const NUMERALS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export const toRoman = (n: number): string => {
  let out = "";
  for (const [value, numeral] of NUMERALS) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
};
