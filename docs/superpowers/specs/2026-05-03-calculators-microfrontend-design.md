# Calculators Microfrontend Integration — Design

**Date:** 2026-05-03
**Status:** Draft, pending user review
**Scope:** Integrate the standalone `calculators` app (deployed at `https://calculators-two-alpha.vercel.app`) into the portfolio website as a tabbed reference project at `/projects/calculators`, composed at runtime via Module Federation 2.

## Context

The portfolio (`portfolio-website/`) already has Module Federation scaffolding via `@originjs/vite-plugin-federation`, but no remotes are registered yet and the empty `remotes.d.ts` and partially-populated `MicrofrontendPage.tsx` (currently filled with unrelated "Vespucci" copy) reflect work-in-progress. The calculators repo (`/Developer/calculators`, host-only — not mounted in this dev container) is configured as a Module Federation 2 remote using `@module-federation/vite`, exposes a top-level app plus six individual calculators, and shares only `react` and `react-dom`.

## Goals

- Surface the calculators app inside the portfolio as a first-class reference project with tabbed navigation.
- Each tab is a deep-linkable URL; refresh and shareable links work.
- Demonstrate true runtime composition (separate deploys, cross-origin fetch of `remoteEntry.js`) — not a build-time copy or iframe.
- Keep the existing portfolio chrome consistent: project page wrapped in `ProjectPageTemplate` like its siblings.

## Non-goals

- No test runner is added — the repo has none today, and adding one for a single feature is scope creep.
- No env-based remote URL or local-dev override; the prod Vercel URL is hardcoded.
- No changes to the calculators repo. The portfolio consumes the remote as published.
- No bundling, vendoring, or build-time copy of calculators code into the portfolio.

## Architecture

### Plugin alignment

The portfolio host is currently using `@originjs/vite-plugin-federation` (MF1-style). The remote uses `@module-federation/vite` (MF2, with `manifest: true`). Cross-version interop is unreliable around shared scope and React-singleton enforcement.

**Decision:** Migrate the host to `@module-federation/vite` to match the remote.

Side-effect cleanup: the originjs-required overrides in `build` (`modulePreload: false`, `minify: false`, `cssCodeSplit: false`) are dropped. The `Cross-Origin-*` response-headers middleware is preserved as-is.

### Host federation config

```ts
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
    react:        { singleton: true, requiredVersion: "^19.0.0" },
    "react/":     { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom":  { singleton: true, requiredVersion: "^19.0.0" },
    "react-dom/": { singleton: true, requiredVersion: "^19.0.0" },
  },
})
```

The shared scope mirrors the remote's exactly. `react-router-dom` is intentionally NOT shared: the remote does not share it either. The portfolio owns all routing; remote modules render leaf UI.

### Overview-tab module — verification required at implementation time

The remote exposes both `./CalculatorsApp` and `./CalculatorsRoutes`. Without inspecting the calculators source we don't know the exact shape of either. There are three plausible cases, each with a different fix:

| Shape of the module | Fits Overview tab? | Action |
|---|---|---|
| `CalculatorsApp` wraps its own `<BrowserRouter>` | ❌ — nesting throws in RR 6+ | Don't use it. Try `CalculatorsRoutes` next. |
| `CalculatorsApp` is router-less (just renders a landing view) | ✅ | Use `CalculatorsApp` for Overview. |
| `CalculatorsRoutes` is a `<Routes>` element rendering a default at index, no path matching | ✅ | Use `CalculatorsRoutes` for Overview. |
| `CalculatorsRoutes` is a `<Routes>` element with multiple internal paths under a prefix | ⚠️ — conflicts with host's per-calc tabs unless given a wildcard, and giving a wildcard re-routes our per-calc URLs through the remote | Don't use it as an index-only mount. Either pick `CalculatorsApp` (if router-less), or coordinate with the calculators repo to add a router-less landing export. |

**Default starting point:** `./CalculatorsRoutes`. **First-load verification is mandatory.** If neither module fits cleanly, the fallback is to drop the Overview tab and ship with the six per-calc tabs only — that's still a working integration. This decision is one line in `tabs.ts` and one line in `remotes.d.ts`; deferring it past first-load is fine.

Aside on the framing: the design says the host owns all routing. Using `CalculatorsRoutes` (or any router-internal-bearing module) means the *remote* owns routing inside the Overview tab. That's deliberate — the Overview tab is opaque to the host by design. The other six tabs remain leaf UI, and the host owns the route between tabs.

## Components & file changes

### New files

- `src/pages/projectPages/CalculatorsPage.tsx`
  Wraps `ProjectPageTemplate` (title `"Calculators"`, subtitle: a one-liner about microfrontend composition). Renders a `<nav>` of `NavLink`s for the seven tabs, then a nested `<Routes>` switching on the active tab. Active-tab styling via NavLink's `isActive`.

- `src/pages/projectPages/calculators/tabs.ts`
  Single source of truth array (`{ slug, label, importer }`) so the tab nav and nested routes stay in sync. Importers are dynamic `import("calculators/...")` calls so each tab is its own chunk.

- `src/pages/projectPages/calculators/RemoteBoundary.tsx`
  Class component error boundary. Catches *remote-load* failures (chunk load errors, network failures during the dynamic import) and renders a host-side fallback ("This demo is offline — view live at calculators-two-alpha.vercel.app"). Used as the **outer** boundary around each lazy-loaded remote module.

- `src/pages/projectPages/calculators/RemoteCrashBoundary.tsx`
  Class component error boundary. Catches *runtime* errors thrown by an already-loaded remote component, and falls back to the remote's `./CalculatorsLoadError` (also lazy-loaded). If `CalculatorsLoadError` itself fails to load, renders a minimal host message rather than re-throwing. Used as the **inner** boundary, between `Suspense` and the lazy remote.

- `src/pages/projectPages/calculators/RemoteTab.tsx`
  Tiny component composing `RemoteBoundary > Suspense > RemoteCrashBoundary > React.lazy(importer)`. Memoizes the lazy component on `importer` identity so tab re-renders don't re-create it.

### Modified files

- `src/App.tsx` — drop `MicrofrontendPage` import and its `/projects/microfrontend` route. Add `CalculatorsPage` mounted at `/projects/calculators/*` (wildcard for nested routes).

- `src/components/home/FeaturedWorkBlock.tsx` — replace the "Project Title" placeholder with:
  - title: `"Calculators (Microfrontend)"`
  - description: `"A standalone calculators app composed into this portfolio at runtime via Module Federation. Each tab is a separately deployed module."`
  - image: `/assets/calculator_placeholder.jpg` (already present in `public/assets/`)
  - link: `/projects/calculators`

- `src/remotes.d.ts` — declare module shapes for `calculators/CalculatorsRoutes`, `calculators/CalculatorsLoadError`, and each `calculators/calc/<slug>` module so TS resolves the dynamic imports.

- `vite.config.ts` — per Architecture section. Drop the originjs plugin and its build overrides; add the MF2 plugin. Keep the `Cross-Origin-*` headers middleware.

- `package.json` — drop `@originjs/vite-plugin-federation`, add `@module-federation/vite`. Do NOT add `@module-federation/runtime`; the design uses static config only.

### Deleted files

- `src/pages/projectPages/MicrofrontendPage.tsx` — Vespucci copy is dropped (decision from clarifying-question round).

## Data flow & runtime

### Route → tab → remote module map

| URL | Tab label | Remote module |
|---|---|---|
| `/projects/calculators` (index) | Overview | `calculators/CalculatorsRoutes` |
| `/projects/calculators/surry-county-offer` | Surry County Offer | `calculators/calc/surry-county-offer` |
| `/projects/calculators/lgs-dscr` | LGS DSCR | `calculators/calc/lgs-dscr` |
| `/projects/calculators/olamina-dscr` | Olamina DSCR | `calculators/calc/olamina-dscr` |
| `/projects/calculators/eu5-loan` | EU5 Loan | `calculators/calc/eu5-loan` |
| `/projects/calculators/winston-salem-lvt` | Winston-Salem LVT | `calculators/calc/winston-salem-lvt` |
| `/projects/calculators/birchwood-rent-sell` | Birchwood Rent vs Sell | `calculators/calc/birchwood-rent-sell` |

### Per-tab render flow

1. NavLink click updates the path via React Router.
2. Matching nested `<Route element={<RemoteTab importer={...}/>}>` mounts.
3. `RemoteTab` calls `React.lazy(importer)` (memoized so it isn't re-created on every render).
4. Tree: `<RemoteBoundary>` → `<Suspense fallback={<HostSpinner/>}>` → `<RemoteCrashBoundary>` → lazy-loaded remote component.
5. Each remote module is its own chunk; only the active tab's chunk fetches. Switching tabs fetches the next chunk lazily; previously visited chunks stay cached for the session.

### Error layering (the layered approach)

- **Outer (`RemoteBoundary`)** catches `ChunkLoadError` and dynamic-import failures. Renders a static host fallback with a link to the live calculators site. This is the case the remote can't help with — its code never loaded.
- **Inner (`RemoteCrashBoundary`)** wraps just the rendered remote. If it throws *after* loading, falls back to the remote's `CalculatorsLoadError` (lazy-loaded, with its own minimal sub-fallback so a failure to load the error component doesn't crash the host).

### Cross-Origin headers — verification step

The existing middleware sets `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`. With `COEP: require-corp`, the cross-origin remote fetch will be blocked unless Vercel returns `Cross-Origin-Resource-Policy: cross-origin` on `remoteEntry.js` and the chunk files.

**Action item during implementation:** load the page once with the dev server and check for COEP errors in the browser console. If present, the fix is one of:
- Add `Cross-Origin-Resource-Policy: cross-origin` to the calculators repo's Vercel config (preferred — closer to the resource).
- Relax the host's `COEP` to `credentialless`, or remove the header entirely if no other portfolio feature requires it.

## Testing & verification

The portfolio has no test runner today; this feature does not add one. Verification combines automated static checks with a manual checklist.

### Automated

- `npm run build` (runs `tsc -b && vite build`) — type-checks `remotes.d.ts`, `CalculatorsPage`, the modified routing, and the new error boundaries.
- `npm run lint`.

### Manual checklist (must pass before declaring done)

1. **Build & type-check pass.**
2. **Home renders.** "Calculators (Microfrontend)" card appears in `FeaturedWorkBlock` with `calculator_placeholder.jpg`. Click navigates to `/projects/calculators`.
3. **Overview tab loads the remote.** DevTools Network shows `remoteEntry.js` fetched from `calculators-two-alpha.vercel.app`, then the `CalculatorsRoutes` chunk. UI renders inside `ProjectPageTemplate`.
4. **Each calculator tab.** Click each of the six calculator tabs. Each fetches its own chunk on first visit; subsequent clicks are cached.
5. **Deep-link.** Paste `/projects/calculators/lgs-dscr` into a fresh tab — the right calculator loads with the LGS DSCR tab active.
6. **Refresh.** Refresh on `/projects/calculators/eu5-loan` — same calculator loads, same tab active. Browser back/forward switches tabs.
7. **Outer error boundary.** Block `calculators-two-alpha.vercel.app` in DevTools, reload — host fallback message renders without crashing the portfolio.
8. **Inner error boundary.** Best-effort: if the live calculators expose a way to throw, confirm `CalculatorsLoadError` renders. If not reproducible from the host, note as untested-in-host.
9. **COEP / CORS sanity.** No `Cross-Origin-*` errors in the console. If present, apply the fix from the Cross-Origin section above.
10. **No regressions.** Yarden, Garibaldi, and Single-Line Drawer pages still load; home parallax still works.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Overview-tab module choice (router nesting / route-prefix conflict) | Default to `CalculatorsRoutes`; verify on first dev load; fallback table in design above. Worst case: ship without Overview tab. |
| COEP blocks cross-origin remote fetch | Verification step in checklist; fix path documented in Cross-Origin section. |
| MF2 plugin migration breaks existing portfolio build | Build is run as item 1 of the manual checklist; failure is caught before any deeper testing. |
| Remote breaking change in `calc/<slug>` exports | Out of scope — coupled to the calculators repo's release discipline. Inner error boundary catches runtime fallout. |

## Out of scope

- Test runner / unit tests / e2e.
- Local-dev override URL for calculators.
- Build-time bundling of calculators code into the portfolio.
- Changes to the calculators repo (other than the optional Vercel `CORP` header fix if needed).
- Visual styling beyond what `ProjectPageTemplate` already provides + a simple tab bar consistent with the portfolio's Tailwind palette.
