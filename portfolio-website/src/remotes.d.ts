/**
 * Type declarations for Module Federation remotes consumed by this host.
 * Updated whenever a new remote is added to vite.config.ts.
 */

import type { ComponentType } from "react";

declare module "calculators/CalculatorsApp" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/CalculatorsRoutes" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/CalculatorsLoadError" {
  const Component: ComponentType<{ error?: Error }>;
  export default Component;
}

declare module "calculators/calc/surry-county-offer" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/calc/lgs-dscr" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/calc/olamina-dscr" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/calc/eu5-loan" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/calc/winston-salem-lvt" {
  const Component: ComponentType;
  export default Component;
}

declare module "calculators/calc/birchwood-rent-sell" {
  const Component: ComponentType;
  export default Component;
}
