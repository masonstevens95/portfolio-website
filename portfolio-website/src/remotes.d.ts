/**
 * Type declarations for Module Federation remotes consumed by this host.
 * Updated whenever a new remote is added to vite.config.ts.
 *
 * NOTE: this file is intentionally an ambient declaration script (no
 * top-level import/export). React's ComponentType is referenced inline
 * via import("react") so the `declare module` blocks remain globally
 * visible to bare specifiers like import("calculators/...").
 */

declare module "calculators/CalculatorsApp" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/CalculatorsRoutes" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/CalculatorsLoadError" {
  const Component: import("react").ComponentType<{ error?: Error }>;
  export default Component;
}

declare module "calculators/calc/rural-land-offer" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/calc/modular-home-dscr" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/calc/eu5-loan" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/calc/winston-salem-lvt" {
  const Component: import("react").ComponentType;
  export default Component;
}

declare module "calculators/calc/rent-sell" {
  const Component: import("react").ComponentType;
  export default Component;
}
