# Overview Tab (iframe Embed) — Design

**Date:** 2026-05-04
**Status:** Draft, pending user review
**Scope:** Reintegrate an Overview tab on the calculators page that embeds the live `https://calculators-two-alpha.vercel.app/` site inside an iframe, restored as the default tab on `/projects/calculators`.

## Context

The earlier microfrontend integration ([2026-05-03 spec](./2026-05-03-calculators-microfrontend-design.md)) shipped six per-calc federated tabs but dropped the Overview tab after `CalculatorsRoutes` threw `useRoutes() may be used only in the context of a <Router> component`. The root cause: the calculators remote bundles its own copy of `react-router-dom` and cannot see the host's Router context. Sharing `react-router-dom` between host and remote would fix the federation path but requires a calculators-repo change.

For the Overview tab specifically, the user wants the experience to match "hosting the root of `https://calculators-two-alpha.vercel.app/`." The simplest interpretation is an iframe — fully isolated, no federation/shared-deps coordination needed, no router conflicts. This spec implements that path. The federation-based Overview remains a future option if the calculators repo ever shares `react-router-dom`.

## Goals

- Restore an Overview tab at `/projects/calculators/overview` that shows the live calculators app.
- Make Overview the default tab — `/projects/calculators` redirects to `/projects/calculators/overview`.
- Keep the existing six per-calc federated tabs untouched.
- Provide an "Open in new tab ↗" escape hatch above the iframe.
- Keep the page chrome consistent with the rest of the portfolio.

## Non-goals

- No two-way communication with the iframe (no `postMessage`).
- No auto-detection of iframe-load failure → host-rendered fallback. Cross-origin restrictions make detection unreliable; the "Open in new tab ↗" link is the user-visible fallback.
- No sandbox attributes on the iframe — the embedded site is the user's own deployed app.
- No federation-side changes (`vite.config.ts`, `remotes.d.ts`, the boundary components, etc. all stay as-is).

## Architecture

The Overview tab is structurally different from the six per-calc tabs: it's an iframe, not a federated module load. To keep the tab-iteration code in `CalculatorsPage` clean and let the tab bar continue to come from a single source of truth, `tabs.ts` becomes a discriminated union:

```ts
type CalculatorTab =
  | { kind: "iframe"; slug: string; label: string; src: string }
  | { kind: "remote"; slug: string; label: string;
      importer: () => Promise<{ default: ComponentType }> };
```

The Overview entry uses `kind: "iframe"`; the existing six entries become `kind: "remote"`. In `CalculatorsPage`'s nested `<Routes>`, the route element is chosen by `tab.kind`:

```tsx
element={
  tab.kind === "iframe"
    ? <IframeTab src={tab.src} />
    : <RemoteTab importer={tab.importer} />
}
```

`IframeTab` is a thin new component: link + iframe, with a thin border and a height that fills most of the visible viewport.

The index redirect changes from `surry-county-offer` → `overview`, so visiting `/projects/calculators` lands on the iframe.

## Components & file changes

### New files

- `src/pages/projectPages/calculators/IframeTab.tsx`
  Renders the iframe surface. Single prop: `{ src: string }`. Layout:
  - Outer wrapper: `w-full` with the open-in-new-tab link aligned right above the frame.
  - Iframe: `w-full h-[calc(100vh-280px)] min-h-[500px] bg-neutral-950 border border-neutral-700 rounded-lg`.
  - Iframe attributes: `src={src}`, `title="Calculators (live demo)"`, `loading="lazy"`.
  - Open-in-new-tab link: `<a href={src} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>` styled to match the portfolio (small, neutral-400, hover white).

### Modified files

- `src/pages/projectPages/calculators/tabs.ts`
  - Convert `CalculatorTab` from a single shape to a discriminated union (`kind: "iframe" | "remote"`).
  - Add the new Overview entry as the first element with `kind: "iframe"`, slug `"overview"`, label `"Overview (iFrame)"`, src `"https://calculators-two-alpha.vercel.app/"`.
  - Mark the six existing entries with `kind: "remote"`.
  - The "Overview tab intentionally omitted" comment block is replaced with a brief comment explaining the iframe choice and that the federation path is deferred.

- `src/pages/projectPages/CalculatorsPage.tsx`
  - The `defaultTabSlug` derivation continues to point at `calculatorTabs[0].slug` and now resolves to `"overview"`.
  - In the `<Routes>` block, the route element is chosen by `tab.kind` (iframe vs remote).
  - No other changes — same tab-bar markup, same NavLink active styling, same absolute-path navigation.

### Untouched

- `App.tsx` — the wildcard `path="/projects/calculators/*"` already covers the new slug.
- `RemoteTab.tsx`, `RemoteBoundary.tsx`, `RemoteCrashBoundary.tsx`, `OfflineFallback.tsx`, `remotes.d.ts`, `vite.config.ts` — all federation-side machinery stays as-is.
- The six existing calc tab data — labels, slugs, importers all identical.

## Behavior & failure modes

### Loading

The browser handles iframe loading natively. While loading, the user sees a blank `bg-neutral-950` frame (matching portfolio palette). No host-side spinner — that would either flash for a fraction of a second on cached loads or get stuck if iframe `onload` never fires. The "Open in new tab ↗" link is always visible.

### Failure modes

- **X-Frame-Options / CSP `frame-ancestors` block embedding.** Vercel does not set these by default, so this should be fine — but if the calculators app explicitly adds `frame-ancestors 'none'` or `'self'`, the iframe renders blank with a console error. Cross-origin restrictions prevent the host from detecting this reliably. Mitigation: the open-in-new-tab link is a known-working alternative; the verification step calls this out.

- **Cross-Origin-Embedder-Policy on the host.** The host's `vite.config.ts` currently sets `Cross-Origin-Embedder-Policy: require-corp`. With `require-corp`, the iframe's response must include `Cross-Origin-Resource-Policy: cross-origin`. If the calculators Vercel deploy does not send CORP, the iframe load is blocked. Verification step covers this; the fix is a one-line change in `vite.config.ts` (`require-corp` → `credentialless`).

- **Network failure / DNS / long load.** Iframe stays blank, escape link visible. No special handling.

No error boundaries needed for `IframeTab` — it is a DOM element with no React-side error path.

### Tab navigation

The Overview tab participates in the existing `<Routes>` mapping. Switching to/from Overview unmounts/mounts the iframe naturally. Navigating away from `/projects/calculators/overview` destroys the iframe and its internal state, which is expected.

The tab bar's active-class detection continues to work because NavLink uses the absolute path `${BASE_PATH}/${tab.slug}` and matches against the current location.

## Sizing detail

The iframe fills most of the viewport using `h-[calc(100vh-280px)] min-h-[500px]`. The `280px` is an estimate of the chrome above the iframe (portfolio top padding + back button + title block + tab bar). If it looks wrong at typical desktop sizes, tune the number — the chrome height varies with font and viewport. The `min-h-[500px]` floor ensures the iframe stays usable on narrow viewports where the chrome is tighter.

## Testing & verification

No test runner is added. Verification is automated checks plus a manual browser-based checklist.

### Automated

- `npx tsc -b` exits 0 — verifies the discriminated-union refactor and the new `IframeTab` component type-check, and that `CalculatorsPage`'s `tab.kind` discriminator is exhaustively handled.
- `npm run lint` shows no new errors in the touched files.

### Manual checklist

1. **Default landing.** Visit `/projects/calculators` → URL becomes `/projects/calculators/overview`, iframe renders the calculators home page.
2. **Tab order.** Tab bar shows: **Overview (iFrame)** first, then Surry County Offer, LGS DSCR, Olamina DSCR, EU5 Loan, Winston-Salem LVT, Birchwood Rent vs Sell.
3. **Active highlight.** Clicking each tab updates both the URL and the active-tab styling. Clicking back to Overview restores the iframe view.
4. **Open-in-new-tab.** The "Open in new tab ↗" link opens `https://calculators-two-alpha.vercel.app/` in a new tab.
5. **Iframe interaction.** Inputs, sub-navigation, and other interactions inside the iframe work. The portfolio URL does NOT change as a result of internal iframe navigation.
6. **Headers check.** Console is clean of frame-related errors. If `X-Frame-Options` or `frame-ancestors` errors appear, the calculators app is blocking embedding (calculators-repo fix, out of scope here). If `Cross-Origin-*` errors appear, relax the host's COEP to `credentialless` in `vite.config.ts`.
7. **Border + sizing.** Thin border with rounded corners is visible. Iframe fills most of the visible viewport height. If the `calc(100vh-280px)` looks off on your typical screen, tune the constant.
8. **Narrow viewport.** The `min-h-[500px]` floor prevents collapse on small screens.
9. **Regression.** The six per-calc tabs continue to work — switching, deep linking, refresh.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Calculators app sets `X-Frame-Options` or restrictive `frame-ancestors`, blocking embedding | Verification step catches this; open-in-new-tab link is the user-facing fallback. Fix would be on the calculators-repo side, out of scope here. |
| COEP `require-corp` blocks the cross-origin iframe | Documented one-line fallback to `credentialless` in `vite.config.ts`. |
| `calc(100vh-280px)` doesn't match real chrome height on user's typical viewport | Tunable constant; `min-h-[500px]` provides a safety floor. |
| Internal iframe navigation surprising users (URL bar doesn't change) | Expected and documented behavior; the open-in-new-tab link is the intended way to "see it standalone." |

## Out of scope

- Federation-based Overview (would require calculators-repo `react-router-dom` shared-deps change).
- `postMessage` two-way iframe communication.
- Iframe load-failure auto-detection from the host.
- Sandbox attributes on the iframe.
- Visual styling beyond the thin border + rounded corners + viewport-height fill.
