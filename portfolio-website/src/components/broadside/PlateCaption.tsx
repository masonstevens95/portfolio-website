/*
  PlateCaption.tsx

  "PLATE I — Tool Rack, front elevation". Per the kit, numbering is used only
  where order is real (sheets, a sequence) and never as decoration, so the
  numeral is optional.
*/

import { Label } from "./Label";

interface Props {
  /** Roman numeral. Omit when the sequence is arbitrary. */
  plate?: string;
  children: React.ReactNode;
  className?: string;
}

export const PlateCaption = ({ plate, children, className = "" }: Props) => (
  <Label as="p" className={`m-0 mb-2 ${className}`}>
    {plate ? `Plate ${plate} — ` : ""}
    {children}
  </Label>
);
