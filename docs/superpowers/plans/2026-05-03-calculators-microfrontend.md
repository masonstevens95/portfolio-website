# Calculators Microfrontend Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the standalone `calculators` app (deployed at `https://calculators-two-alpha.vercel.app`) into the portfolio at `/projects/calculators` as a tabbed reference project, composed at runtime via Module Federation 2.

**Architecture:** Migrate the host's Vite federation plugin from `@originjs/vite-plugin-federation` (MF1) to `@module-federation/vite` (MF2) to match the remote. Host owns tab navigation via React Router; each of seven tabs lazy-loads a separate exposed module with a layered error-boundary system (host fallback for load failures, remote's `CalculatorsLoadError` for runtime failures).

**Tech Stack:** React 19, React Router 7, Vite 7, Tailwind 4, `@module-federation/vite`, TypeScript.

**Spec:** `docs/superpowers/specs/2026-05-03-calculators-microfrontend-design.md` (committed `f00b13c`).

**Note about TDD:** The portfolio repo has no test runner today. Per the spec, this feature does not add one. Each task substitutes the "run failing test" step with `npm run build` (TypeScript + Vite type check) and, where applicable, browser-based manual verification. The final task is a full manual checklist run.

**Note about WIP files:** The user's working tree currently contains in-progress changes to `vite.config.ts`, `App.tsx`, `FeaturedWorkBlock.tsx`, plus untracked `MicrofrontendPage.tsx` and an empty `remotes.d.ts`. This plan treats those WIP files as the starting point and explicitly overwrites/edits them. Do not stash or revert them before starting.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `portfolio-website/package.json` | Modify | Swap federation plugin dependency. |
| `portfolio-website/vite.config.ts` | Overwrite | MF2 plugin config, remote registration, shared scope. |
| `portfolio-website/src/remotes.d.ts` | Overwrite | TypeScript module declarations for all consumed remote exposes. |
| `portfolio-website/src/pages/projectPages/calculators/tabs.ts` | Create | Single source of truth for the seven tabs (`{ slug, label, importer }`). |
| `portfolio-website/src/pages/projectPages/calculators/RemoteBoundary.tsx` | Create | Outer error boundary; catches `remoteEntry.js`/chunk load failures. |
| `portfolio-website/src/pages/projectPages/calculators/RemoteCrashBoundary.tsx` | Create | Inner error boundary; falls back to remote's `CalculatorsLoadError`. |
| `portfolio-website/src/pages/projectPages/calculators/RemoteTab.tsx` | Create | Composes outer boundary + Suspense + inner boundary + lazy remote. |
| `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx` | Create | Page with `ProjectPageTemplate`, NavLink tab bar, nested `<Routes>`. |
| `portfolio-website/src/App.tsx` | Modify | Replace `/projects/microfrontend` route with `/projects/calculators/*`. |
| `portfolio-website/src/components/home/FeaturedWorkBlock.tsx` | Modify | Replace "Project Title" placeholder card with calculators card. |
| `portfolio-website/src/pages/projectPages/MicrofrontendPage.tsx` | Delete | Vespucci copy is dropped. |

---

## Task 1: Migrate the host federation plugin

**Files:**
- Modify: `portfolio-website/package.json`
- Overwrite: `portfolio-website/vite.config.ts`

- [ ] **Step 1: Uninstall the old plugin and install the new one**

Run from `portfolio-website/`:
```bash
cd portfolio-website
npm uninstall @originjs/vite-plugin-federation
npm install --save-dev @module-federation/vite
```

Expected: `package.json` `devDependencies` no longer lists `@originjs/vite-plugin-federation` and now lists `@module-federation/vite`. `node_modules/@module-federation/vite/` exists.

- [ ] **Step 2: Overwrite `vite.config.ts`**

Replace the entire contents of `portfolio-website/vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
    federation({
      name: "portfolio-shell",
      remotes: {
        calculators: {
          type: "module",
          name: "calculators",
          entry: "https://calculators-two-alpha.vercel.app/remoteEntry.js",
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react/": { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom/": { singleton: true, requiredVersion: "^19.0.0" },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
});
```

The originjs-required `modulePreload: false`, `minify: false`, and `cssCodeSplit: false` overrides are intentionally dropped — MF2 does not need them.

- [ ] **Step 3: Verify build still succeeds**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes without errors. (At this point, no remote modules are imported anywhere yet, so the remote isn't actually fetched — we're just verifying the plugin migration didn't break the existing build.)

If the build fails with a TypeScript error about `@module-federation/vite` not being a module, that means the package's types haven't loaded; re-run `npm install` and try again.

- [ ] **Step 4: Commit**

```bash
git -C /workspace add portfolio-website/package.json portfolio-website/package-lock.json portfolio-website/vite.config.ts
git -C /workspace commit -m "chore(portfolio): migrate vite federation plugin to @module-federation/vite

Replaces @originjs/vite-plugin-federation (MF1) with @module-federation/vite
(MF2) to match the calculators remote's plugin and avoid cross-version
shared-scope and React-singleton issues."
```

---

## Task 2: Declare remote module types

**Files:**
- Overwrite: `portfolio-website/src/remotes.d.ts`

- [ ] **Step 1: Overwrite `remotes.d.ts`**

Replace the entire contents of `portfolio-website/src/remotes.d.ts` with:

```ts
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
```

- [ ] **Step 2: Verify TypeScript still compiles**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes. (No file imports these modules yet, but `tsc -b` should still parse the declaration file.)

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/remotes.d.ts
git -C /workspace commit -m "feat(portfolio): declare remote module types for calculators microfrontend"
```

---

## Task 3: Create the tabs source-of-truth

**Files:**
- Create: `portfolio-website/src/pages/projectPages/calculators/tabs.ts`

- [ ] **Step 1: Create the directory**

Run from `/workspace/`:
```bash
mkdir -p portfolio-website/src/pages/projectPages/calculators
```

- [ ] **Step 2: Write `tabs.ts`**

Create `portfolio-website/src/pages/projectPages/calculators/tabs.ts` with:

```ts
import type { ComponentType } from "react";

export interface CalculatorTab {
  /** URL slug appended to /projects/calculators. Empty string = index (Overview). */
  slug: string;
  label: string;
  /** Dynamic import of the federation-exposed module. Each tab is its own chunk. */
  importer: () => Promise<{ default: ComponentType }>;
}

export const calculatorTabs: CalculatorTab[] = [
  {
    slug: "",
    label: "Overview",
    importer: () => import("calculators/CalculatorsRoutes"),
  },
  {
    slug: "surry-county-offer",
    label: "Surry County Offer",
    importer: () => import("calculators/calc/surry-county-offer"),
  },
  {
    slug: "lgs-dscr",
    label: "LGS DSCR",
    importer: () => import("calculators/calc/lgs-dscr"),
  },
  {
    slug: "olamina-dscr",
    label: "Olamina DSCR",
    importer: () => import("calculators/calc/olamina-dscr"),
  },
  {
    slug: "eu5-loan",
    label: "EU5 Loan",
    importer: () => import("calculators/calc/eu5-loan"),
  },
  {
    slug: "winston-salem-lvt",
    label: "Winston-Salem LVT",
    importer: () => import("calculators/calc/winston-salem-lvt"),
  },
  {
    slug: "birchwood-rent-sell",
    label: "Birchwood Rent vs Sell",
    importer: () => import("calculators/calc/birchwood-rent-sell"),
  },
];
```

- [ ] **Step 3: Verify TypeScript resolves the dynamic imports**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes without errors. If TS complains about `Cannot find module 'calculators/...'`, Task 2 was skipped or `remotes.d.ts` is malformed.

- [ ] **Step 4: Commit**

```bash
git -C /workspace add portfolio-website/src/pages/projectPages/calculators/tabs.ts
git -C /workspace commit -m "feat(portfolio): add tab source-of-truth for calculators page"
```

---

## Task 4: Create the outer remote-load error boundary

**Files:**
- Create: `portfolio-website/src/pages/projectPages/calculators/RemoteBoundary.tsx`

- [ ] **Step 1: Write `RemoteBoundary.tsx`**

Create `portfolio-website/src/pages/projectPages/calculators/RemoteBoundary.tsx` with:

```tsx
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Outer boundary for federated remote modules. Catches load failures
 * (network errors, ChunkLoadError) — i.e. the case where the remote's
 * code never reaches the host. Cannot rely on remote-provided error
 * components here; they haven't loaded.
 */
export class RemoteBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Calculators remote failed to load:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full mx-auto px-4 py-12 text-center text-neutral-300">
          <h2 className="text-2xl font-bold text-neutral-100 mb-2">
            This demo is offline
          </h2>
          <p>
            The calculators microfrontend couldn't be loaded. View it live at{" "}
            <a
              href="https://calculators-two-alpha.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              calculators-two-alpha.vercel.app
            </a>
            .
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/pages/projectPages/calculators/RemoteBoundary.tsx
git -C /workspace commit -m "feat(portfolio): add outer error boundary for remote load failures"
```

---

## Task 5: Create the inner runtime-error boundary

**Files:**
- Create: `portfolio-website/src/pages/projectPages/calculators/RemoteCrashBoundary.tsx`

- [ ] **Step 1: Write `RemoteCrashBoundary.tsx`**

Create `portfolio-website/src/pages/projectPages/calculators/RemoteCrashBoundary.tsx` with:

```tsx
import { Component, lazy, Suspense, type ReactNode } from "react";

const CalculatorsLoadError = lazy(
  () => import("calculators/CalculatorsLoadError")
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Sub-boundary used when even the remote's CalculatorsLoadError fails
 * to load (network blip mid-session). Renders a minimal host-side
 * fallback so that doesn't bubble up to the outer RemoteBoundary
 * (whose "offline" message would be misleading at that point).
 */
class ErrorComponentBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-neutral-400 text-center py-8">
          Something went wrong rendering this calculator.
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Inner boundary for federated remote modules. Catches errors thrown
 * by the remote AFTER it has loaded (calc threw at runtime). Falls
 * back to the remote's own CalculatorsLoadError component.
 */
export class RemoteCrashBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Calculators remote runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorComponentBoundary>
          <Suspense
            fallback={
              <div className="text-neutral-400 text-center py-8">
                Something went wrong.
              </div>
            }
          >
            <CalculatorsLoadError error={this.state.error} />
          </Suspense>
        </ErrorComponentBoundary>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes. If TS complains about `Cannot find module 'calculators/CalculatorsLoadError'`, Task 2's `remotes.d.ts` is wrong.

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/pages/projectPages/calculators/RemoteCrashBoundary.tsx
git -C /workspace commit -m "feat(portfolio): add inner error boundary using remote's CalculatorsLoadError"
```

---

## Task 6: Create the per-tab lazy-loader composer

**Files:**
- Create: `portfolio-website/src/pages/projectPages/calculators/RemoteTab.tsx`

- [ ] **Step 1: Write `RemoteTab.tsx`**

Create `portfolio-website/src/pages/projectPages/calculators/RemoteTab.tsx` with:

```tsx
import { lazy, Suspense, useMemo, type ComponentType } from "react";
import { RemoteBoundary } from "./RemoteBoundary";
import { RemoteCrashBoundary } from "./RemoteCrashBoundary";

interface Props {
  importer: () => Promise<{ default: ComponentType }>;
}

/**
 * Lazy-loads a federated remote module and wraps it with the layered
 * error boundaries. The lazy component is memoized on the importer
 * identity so re-renders don't re-create it (which would re-fetch).
 */
export function RemoteTab({ importer }: Props) {
  const LazyComponent = useMemo(() => lazy(importer), [importer]);

  return (
    <RemoteBoundary>
      <Suspense
        fallback={
          <div className="text-neutral-400 text-center py-8">Loading…</div>
        }
      >
        <RemoteCrashBoundary>
          <LazyComponent />
        </RemoteCrashBoundary>
      </Suspense>
    </RemoteBoundary>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/pages/projectPages/calculators/RemoteTab.tsx
git -C /workspace commit -m "feat(portfolio): add RemoteTab composer for federated tab content"
```

---

## Task 7: Create the calculators page with tab nav

**Files:**
- Create: `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx`

- [ ] **Step 1: Write `CalculatorsPage.tsx`**

Create `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx` with:

```tsx
import { NavLink, Routes, Route } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { RemoteTab } from "./calculators/RemoteTab";
import { calculatorTabs } from "./calculators/tabs";

export const CalculatorsPage = () => (
  <ProjectPageTemplate
    title="Calculators"
    subtitle="A standalone calculators app composed into this portfolio at runtime via Module Federation."
  >
    <nav
      aria-label="Calculator tabs"
      className="flex flex-wrap gap-2 border-b border-neutral-700 pb-2 max-w-6xl mx-auto w-full px-4"
    >
      {calculatorTabs.map((tab) => (
        <NavLink
          key={tab.slug || "overview"}
          to={tab.slug}
          end={tab.slug === ""}
          className={({ isActive }) =>
            `px-3 py-2 rounded-t text-sm transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>

    <div className="w-full max-w-6xl mx-auto px-4">
      <Routes>
        {calculatorTabs.map((tab) => (
          <Route
            key={tab.slug || "overview"}
            path={tab.slug || "/"}
            element={<RemoteTab importer={tab.importer} />}
          />
        ))}
      </Routes>
    </div>
  </ProjectPageTemplate>
);
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes. (The page isn't imported by `App.tsx` yet, but `tsc -b` will type-check the new file via project references.)

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/pages/projectPages/CalculatorsPage.tsx
git -C /workspace commit -m "feat(portfolio): add CalculatorsPage with tabbed remote module navigation"
```

---

## Task 8: Wire the new route into App.tsx and remove MicrofrontendPage

**Files:**
- Modify: `portfolio-website/src/App.tsx`
- Delete: `portfolio-website/src/pages/projectPages/MicrofrontendPage.tsx`

- [ ] **Step 1: Replace `App.tsx`**

Overwrite `portfolio-website/src/App.tsx` with:

```tsx
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { YardenPage } from "./pages/projectPages/YardenPage";
import { GaribaldiPage } from "./pages/projectPages/GaribaldiPage";
import { CalculatorsPage } from "./pages/projectPages/CalculatorsPage";
import { VoiceGardenPage } from "./pages/projectPages/VoiceGardenPage";
import { VicSavePage } from "./pages/projectPages/VicSavePage";
import { HortibasePage } from "./pages/projectPages/HortibasePage";
import { SingleLineDrawerPage } from "./pages/projectPages/SingleLineDrawerPage";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/yarden-diy" element={<YardenPage />} />
        <Route path="/projects/garibaldi" element={<GaribaldiPage />} />
        <Route
          path="/projects/calculators/*"
          element={<CalculatorsPage />}
        />
        <Route path="/projects/voice-garden" element={<VoiceGardenPage />} />
        <Route path="/projects/vicsave-compiler" element={<VicSavePage />} />
        <Route path="/projects/hortibase" element={<HortibasePage />} />
        <Route
          path="/projects/single-line-drawer"
          element={<SingleLineDrawerPage />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
```

The key changes vs the WIP `App.tsx`: drop the `MicrofrontendPage` import, drop the `/projects/microfrontend` route, add the `CalculatorsPage` import and the wildcard `/projects/calculators/*` route.

- [ ] **Step 2: Delete the obsolete page file**

Run from `/workspace/`:
```bash
rm portfolio-website/src/pages/projectPages/MicrofrontendPage.tsx
```

- [ ] **Step 3: Verify build**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes. If TS complains about a missing `MicrofrontendPage` import somewhere else, search the repo for stragglers:
```bash
grep -rn "MicrofrontendPage" portfolio-website/src/
```
There should be zero results.

- [ ] **Step 4: Commit**

```bash
git -C /workspace add portfolio-website/src/App.tsx portfolio-website/src/pages/projectPages/MicrofrontendPage.tsx
git -C /workspace commit -m "feat(portfolio): route /projects/calculators to the new CalculatorsPage

Drops the unused MicrofrontendPage (Vespucci copy) along the way."
```

---

## Task 9: Update the homepage featured-work card

**Files:**
- Modify: `portfolio-website/src/components/home/FeaturedWorkBlock.tsx`

- [ ] **Step 1: Replace the placeholder card entry**

In `portfolio-website/src/components/home/FeaturedWorkBlock.tsx`, locate the array entry currently reading:

```tsx
{
  title: "Project Title",
  description: "Project description goes here.",
  image: "/assets/garibaldi.jpg", // replace with project image
  link: "/projects/microfrontend",
},
```

Replace it with:

```tsx
{
  title: "Calculators (Microfrontend)",
  description:
    "A standalone calculators app composed into this portfolio at runtime via Module Federation. Each tab is a separately deployed module.",
  image: "/assets/calculator_placeholder.jpg",
  link: "/projects/calculators",
},
```

- [ ] **Step 2: Verify build**

Run from `portfolio-website/`:
```bash
npm run build
```

Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git -C /workspace add portfolio-website/src/components/home/FeaturedWorkBlock.tsx portfolio-website/public/assets/calculator_placeholder.jpg
git -C /workspace commit -m "feat(portfolio): replace placeholder card with calculators microfrontend card"
```

(Note: the `calculator_placeholder.jpg` asset is already untracked in the working tree from earlier WIP; this commit also tracks it.)

---

## Task 10: End-to-end verification + Overview-tab decision + COEP fix if needed

This task runs the manual checklist from the spec. It produces no commits unless step 4 or step 7 finds an issue requiring code changes.

**Files:** none planned. Two contingent edits, depending on what verification reveals:
- Possibly modify: `portfolio-website/src/pages/projectPages/calculators/tabs.ts` (Overview-tab module swap).
- Possibly modify: `portfolio-website/vite.config.ts` (COEP relaxation), or document a Vercel CORP header fix on the calculators repo side.

- [ ] **Step 1: Start the dev server**

Run from `portfolio-website/`:
```bash
npm run dev
```

Expected: Vite reports a local URL (default `http://localhost:5173`). Open it in a browser. The home page renders with the parallax effect and the featured-work row.

- [ ] **Step 2: Verify the homepage card**

Confirm that one card shows:
- title `Calculators (Microfrontend)`
- the description blurb
- `/assets/calculator_placeholder.jpg` as the background image
- clicking it navigates to `/projects/calculators`

- [ ] **Step 3: Verify the Overview tab loads the remote**

On `/projects/calculators` (Overview tab), open DevTools → Network. Filter for `vercel.app`. Expected:
- `remoteEntry.js` 200 from `calculators-two-alpha.vercel.app`
- a follow-up chunk for `CalculatorsRoutes` 200

The portfolio's `ProjectPageTemplate` chrome is visible (back button, title, subtitle), the tab bar is below it, and the remote's UI renders below that.

- [ ] **Step 4: Resolve the Overview-tab module choice**

Three possible outcomes from step 3:

**(a) Overview tab renders correctly.** No action. Continue to step 5.

**(b) Console shows `useRoutes() may be used only in the context of a <Router>` or `You cannot render a <Router> inside another <Router>`.** This means `CalculatorsRoutes` is router-wrapped or expects a parent prefix that doesn't match. Try swapping the importer in `tabs.ts` to `() => import("calculators/CalculatorsApp")`. Also update the type declaration if needed (already declared in `remotes.d.ts`). Re-run the dev server. If `CalculatorsApp` also nests a router, fall through to (c).

**(c) Neither module fits cleanly.** Drop the Overview tab from `calculatorTabs` in `tabs.ts` so the page ships with six per-calc tabs only. Make the first per-calc tab the index by setting its `slug: ""` and adjusting URLs accordingly, OR redirect `/projects/calculators` to `/projects/calculators/surry-county-offer` via a `<Route index element={<Navigate to="surry-county-offer" replace />} />`. Document the decision in a follow-up note in the spec.

If you make changes here, commit them:
```bash
git -C /workspace add portfolio-website/src/pages/projectPages/calculators/tabs.ts
git -C /workspace commit -m "fix(portfolio): adjust Overview tab module per first-load verification"
```

- [ ] **Step 5: Verify each per-calc tab**

Click each of the six calculator tabs. Each should:
- Trigger a fresh chunk fetch on first visit (visible in Network tab).
- Render the calculator's UI inside the `ProjectPageTemplate` chrome.
- Update the URL (e.g. `/projects/calculators/lgs-dscr`).
- Highlight the corresponding `NavLink` as active.

- [ ] **Step 6: Verify deep-link and refresh**

In a fresh browser tab, paste `/projects/calculators/eu5-loan` directly into the URL bar. Expected: the EU5 Loan tab is active and its UI is rendered. Refresh the tab — same state. Use browser back/forward to navigate between tabs.

- [ ] **Step 7: Verify cross-origin headers**

While on `/projects/calculators` (Overview), check the browser console for any error containing `Cross-Origin-Embedder-Policy` or `NotSameOriginAfterDefaultedToSameOriginByCoep` or similar. If clean → continue to step 8.

If the console shows COEP errors blocking the cross-origin fetch, choose one fix:

**(a) Relax COEP on the host (fastest).** In `portfolio-website/vite.config.ts`, change `"require-corp"` to `"credentialless"`:
```ts
res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
```
Restart the dev server, retry. Commit:
```bash
git -C /workspace add portfolio-website/vite.config.ts
git -C /workspace commit -m "fix(portfolio): relax COEP to credentialless to allow cross-origin remote"
```

**(b) Add CORP on the remote (cleaner long-term, requires calculators repo change).** Document this as a follow-up issue: the calculators Vercel deploy needs to send `Cross-Origin-Resource-Policy: cross-origin` on `remoteEntry.js` and chunk files (typically via `vercel.json` headers config). Out of scope for this plan; relaxing COEP on the host is the in-scope fix.

- [ ] **Step 8: Verify error boundaries**

Outer boundary test:
1. In DevTools → Network, right-click the `calculators-two-alpha.vercel.app` host and "Block request domain".
2. Refresh `/projects/calculators`.
3. Expected: the page renders the host fallback ("This demo is offline — view live at calculators-two-alpha.vercel.app"). Other portfolio pages (home, Yarden, etc.) still work.
4. Unblock the domain.

Inner boundary test (best effort):
1. If the live calculators have any input that throws when given pathological input, exercise it.
2. Expected: the remote's `CalculatorsLoadError` renders inside the calc area; the rest of the portfolio is unaffected.
3. If you can't reproduce, note "inner boundary not exercised in host" — coverage relies on the calculators repo's own QA.

- [ ] **Step 9: Verify no regressions on other pages**

Click through `/projects/yarden-diy`, `/projects/garibaldi`, `/projects/single-line-drawer`. Each should render normally. The home parallax should still work. The `Cross-Origin-*` headers middleware change (if any was made in step 7) should not affect non-federation features — but verify just to be sure.

- [ ] **Step 10: Final build pass**

Run from `portfolio-website/`:
```bash
npm run build
npm run lint
```

Both should pass.

- [ ] **Step 11: Final commit if anything was added during verification**

If you made any verification-driven edits in steps 4 or 7, they should already be committed. If you added any other files (e.g. notes), commit them now. Otherwise this step is a no-op.

```bash
git -C /workspace status
```

Expected: clean working tree.

---

## Self-Review Checklist Coverage

Mapping spec sections to tasks (run as part of writing this plan):

| Spec section | Task(s) |
|---|---|
| Architecture / plugin alignment | Task 1 |
| Host federation config | Task 1 |
| Open question: Overview-tab module | Tasks 3, 7, 10 (step 4) |
| New CalculatorsPage | Task 7 |
| `tabs.ts` source-of-truth | Task 3 |
| `RemoteBoundary` | Task 4 |
| `RemoteCrashBoundary` | Task 5 |
| `RemoteTab` | Task 6 |
| `App.tsx` route swap | Task 8 |
| `FeaturedWorkBlock` card | Task 9 |
| `remotes.d.ts` declarations | Task 2 |
| Delete `MicrofrontendPage.tsx` | Task 8 |
| `package.json` plugin swap | Task 1 |
| Route → tab → remote module map | Task 3 |
| Per-tab render flow | Tasks 6, 7 |
| Error layering | Tasks 4, 5, 6 |
| COEP / cross-origin headers verification | Task 10 (step 7) |
| Manual verification checklist (10 items) | Task 10 |
