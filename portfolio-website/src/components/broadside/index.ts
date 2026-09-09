/*
  Broadside primitives.

  The structural devices that carry the brand: rules, article heads, plate
  captions, title blocks, the masthead. Two inks on stock is not enough on
  its own to read as a broadside — these are what make it one.

  Callers position; primitives own their own type, color, and rule treatment.
  If a component needs a rule, a label, or a title block, it composes from
  here rather than restyling.
*/

export { Rule } from "./Rule";
export { DoubleRule } from "./DoubleRule";
export { Label } from "./Label";
export { Masthead } from "./Masthead";
export { SectionHead } from "./SectionHead";
export { PlateCaption } from "./PlateCaption";
export { TitleBlock } from "./TitleBlock";
