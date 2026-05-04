# Overview Tab (iframe Embed) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore an Overview tab on the calculators page that embeds `https://calculators-two-alpha.vercel.app/` as an iframe, set as the default tab on `/projects/calculators`.

**Architecture:** Convert `tabs.ts` from a single shape to a discriminated union (`kind: "iframe" | "remote"`). Add the Overview entry as the first iframe-kind tab. `CalculatorsPage` dispatches each route's element on `tab.kind` — `<IframeTab>` for iframe tabs, `<RemoteTab>` for the existing six federated tabs. No federation-side machinery changes.

**Tech Stack:** React 19, React Router 7, Tailwind 4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-05-04-overview-tab-iframe-design.md` (committed `5ab7bdb`).

**Note about TDD:** No test runner in the repo. Verification is `npx tsc -b` (type check) plus a manual browser checklist. The three file changes in Task 1 are a single coherent unit and commit together.

**Note about branching:** Recent work has been going directly to `main`. This plan is small (3 files); pick whichever fits — feature branch (`feat/overview-iframe-tab`) for isolation, or `main` for a fast turnaround. The plan's git commands assume the current branch.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `portfolio-website/src/pages/projectPages/calculators/tabs.ts` | Modify | Convert to discriminated union; add Overview iframe entry; mark existing six entries as `kind: "remote"`. |
| `portfolio-website/src/pages/projectPages/calculators/IframeTab.tsx` | Create | Renders the iframe surface: open-in-new-tab link + bordered, viewport-filling iframe. |
| `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx` | Modify | Import `IframeTab`; switch route element by `tab.kind` (iframe vs remote). |

No other files change.

---

## Task 1: Implement the iframe Overview tab

The three file changes are a single coherent unit (union shape + iframe component + dispatch). Editing them separately would leave intermediate type errors; that's expected. Don't commit until all three are in place and `tsc -b` is clean.

**Files:**
- Modify: `portfolio-website/src/pages/projectPages/calculators/tabs.ts`
- Create: `portfolio-website/src/pages/projectPages/calculators/IframeTab.tsx`
- Modify: `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx`

- [ ] **Step 1: Overwrite `tabs.ts`**

Replace the entire contents of `portfolio-website/src/pages/projectPages/calculators/tabs.ts` with:

```ts
import type { ComponentType } from "react";

export type CalculatorTab =
  | {
      kind: "iframe";
      slug: string;
      label: string;
      src: string;
    }
  | {
      kind: "remote";
      slug: string;
      label: string;
      /** Dynamic import of the federation-exposed module. Each tab is its own chunk. */
      importer: () => Promise<{ default: ComponentType }>;
    };

// Overview embeds the live calculators app via iframe instead of a federated
// mount. Federation-based Overview is blocked by the remote bundling its
// own copy of react-router-dom (host's Router context isn't visible to it).
// Sharing react-router-dom on both sides is the proper future fix.
export const calculatorTabs: CalculatorTab[] = [
  {
    kind: "iframe",
    slug: "overview",
    label: "Overview (iFrame)",
    src: "https://calculators-two-alpha.vercel.app/",
  },
  {
    kind: "remote",
    slug: "surry-county-offer",
    label: "Surry County Offer",
    importer: () => import("calculators/calc/surry-county-offer"),
  },
  {
    kind: "remote",
    slug: "lgs-dscr",
    label: "LGS DSCR",
    importer: () => import("calculators/calc/lgs-dscr"),
  },
  {
    kind: "remote",
    slug: "olamina-dscr",
    label: "Olamina DSCR",
    importer: () => import("calculators/calc/olamina-dscr"),
  },
  {
    kind: "remote",
    slug: "eu5-loan",
    label: "EU5 Loan",
    importer: () => import("calculators/calc/eu5-loan"),
  },
  {
    kind: "remote",
    slug: "winston-salem-lvt",
    label: "Winston-Salem LVT",
    importer: () => import("calculators/calc/winston-salem-lvt"),
  },
  {
    kind: "remote",
    slug: "birchwood-rent-sell",
    label: "Birchwood Rent vs Sell",
    importer: () => import("calculators/calc/birchwood-rent-sell"),
  },
];
```

After this edit, `tsc -b` will fail on `CalculatorsPage.tsx` because it accesses `tab.importer` on a union that may not have it. That's expected; Step 3 fixes it.

- [ ] **Step 2: Create `IframeTab.tsx`**

Create `portfolio-website/src/pages/projectPages/calculators/IframeTab.tsx` with EXACTLY this content:

```tsx
interface Props {
  src: string;
}

export function IframeTab({ src }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={src}
        title="Calculators (live demo)"
        loading="lazy"
        className="w-full h-[calc(100vh-280px)] min-h-[500px] bg-neutral-950 border border-neutral-700 rounded-lg"
      />
    </div>
  );
}
```

Notes baked into this component:
- `loading="lazy"` — iframe doesn't fetch until it's in viewport. (Defensive default; React only mounts the matched route's element anyway.)
- `title` — accessibility label for the iframe.
- No `sandbox` attribute — embedded site is the user's own app, no need to restrict.
- No `onLoad`/`onError` — cross-origin restrictions make these unreliable; the open-in-new-tab link is the user-visible fallback.

- [ ] **Step 3: Overwrite `CalculatorsPage.tsx`**

Replace the entire contents of `portfolio-website/src/pages/projectPages/CalculatorsPage.tsx` with:

```tsx
import { NavLink, Navigate, Routes, Route } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { IframeTab } from "./calculators/IframeTab";
import { RemoteTab } from "./calculators/RemoteTab";
import { calculatorTabs } from "./calculators/tabs";

const BASE_PATH = "/projects/calculators";
const defaultTabSlug = calculatorTabs[0].slug;

export const CalculatorsPage = () => (
  <ProjectPageTemplate
    title="Calculators"
    subtitle="A standalone calculators app composed into this portfolio at runtime via Module Federation."
  >
    <div className="w-full flex flex-col">
      <nav
        aria-label="Calculator tabs"
        className="flex flex-wrap gap-2 border-b border-neutral-700 pb-2 max-w-6xl mx-auto w-full px-4"
      >
        {calculatorTabs.map((tab) => (
          <NavLink
            key={tab.slug}
            to={`${BASE_PATH}/${tab.slug}`}
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

      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <Routes>
          <Route
            index
            element={<Navigate to={`${BASE_PATH}/${defaultTabSlug}`} replace />}
          />
          {calculatorTabs.map((tab) => (
            <Route
              key={tab.slug}
              path={tab.slug}
              element={
                tab.kind === "iframe" ? (
                  <IframeTab src={tab.src} />
                ) : (
                  <RemoteTab importer={tab.importer} />
                )
              }
            />
          ))}
        </Routes>
      </div>
    </div>
  </ProjectPageTemplate>
);
```

Key change vs the prior version: the `<Route>` element is now a ternary on `tab.kind`. TypeScript narrows the union inside each branch — `tab.src` is only accessible when `kind === "iframe"`, `tab.importer` only when `kind === "remote"`. Everything else (tab nav markup, NavLink active styling, `defaultTabSlug` derivation, BASE_PATH constant) is unchanged. `defaultTabSlug` will now resolve to `"overview"` because Overview is the first array entry.

- [ ] **Step 4: Verify TypeScript compiles**

Run from `portfolio-website/`:
```bash
npx tsc -b
```

Expected: exit code 0. If it complains about `Property 'importer' does not exist on type ...`, Step 3 wasn't applied or the ternary doesn't narrow correctly — re-check that the discriminator is `tab.kind === "iframe"` (strict equality on a string literal).

- [ ] **Step 5: Commit all three files together**

```bash
git -C /workspace add \
  portfolio-website/src/pages/projectPages/calculators/tabs.ts \
  portfolio-website/src/pages/projectPages/calculators/IframeTab.tsx \
  portfolio-website/src/pages/projectPages/CalculatorsPage.tsx
git -C /workspace commit -m "feat(portfolio): add Overview iframe tab as default for calculators page

Embeds https://calculators-two-alpha.vercel.app/ in an iframe under
/projects/calculators/overview, set as the default tab via the index
redirect. Sidesteps the unshared react-router-dom issue that blocked
the federation-based Overview attempt; CalculatorsApp/CalculatorsRoutes
remain available as a future option once the calculators repo shares
react-router-dom.

Restructures CalculatorTab as a discriminated union (kind: 'iframe' |
'remote') so the existing six federated tabs and the new iframe tab
share one source-of-truth array."
```

Single coherent commit — bisect won't land on a broken-build intermediate.

---

## Task 2: End-to-end manual verification

This task does not produce commits unless verification finds an issue requiring a fix. The contingent COEP fix in Step 9 is the only commit-producing branch.

- [ ] **Step 1: Start the dev server**

Run from `portfolio-website/`:
```bash
npm run dev
```

Expected: Vite reports a local URL (default `http://localhost:5173`). Open it in a browser.

- [ ] **Step 2: Tab order**

On `/projects/calculators`, the tab bar should show, left to right:
1. **Overview (iFrame)**
2. Surry County Offer
3. LGS DSCR
4. Olamina DSCR
5. EU5 Loan
6. Winston-Salem LVT
7. Birchwood Rent vs Sell

Overview is visually first.

- [ ] **Step 3: Default landing**

Visit `/projects/calculators` (no slug). The URL should immediately rewrite to `/projects/calculators/overview`. The iframe should appear, eventually showing the calculators home page.

- [ ] **Step 4: Iframe sizing & border**

The iframe should:
- Have a thin border with rounded corners.
- Fill most of the visible viewport height.
- Show the "Open in new tab ↗" link aligned to the right above the frame.

If the iframe height looks visibly off, tune the `calc(100vh-280px)` constant in `IframeTab.tsx`. The `min-h-[500px]` floor is for narrow viewports.

- [ ] **Step 5: Open-in-new-tab link**

Click the link → opens `https://calculators-two-alpha.vercel.app/` in a new tab. Returning to the portfolio tab — Overview tab is still the active one, no state lost.

- [ ] **Step 6: Iframe interaction**

Click into the iframe and use the calculators app — fill an input, click a button, navigate inside it. The portfolio URL bar should NOT change as a result. Tab highlight stays on Overview.

- [ ] **Step 7: Switching to per-calc tabs**

Click each of the six per-calc tabs. Each should:
- Update the URL to `/projects/calculators/<slug>`.
- Update the active tab highlight.
- Mount the corresponding calculator (or render the existing CalculatorsLoadError fallback if the per-calc components also use react-router internally — that's the known pre-existing issue, out of scope here).

- [ ] **Step 8: Switching back to Overview**

Click the Overview tab from any per-calc tab. URL becomes `/projects/calculators/overview`. The iframe re-mounts and the calculators home page loads. (Each visit is a fresh iframe, prior in-iframe state is lost — expected.)

- [ ] **Step 9: Header check (contingent fix)**

Open DevTools console. Look for any of:

**(a) `X-Frame-Options` errors** → calculators app is blocking embedding. Fix is on the calculators-repo side (out of scope here). Document and stop.

**(b) `frame-ancestors` CSP errors** → same as (a). Out of scope.

**(c) `Cross-Origin-Embedder-Policy` errors blocking the iframe** → relax host's COEP. Edit `portfolio-website/vite.config.ts`, find the COEP header in the `configure-response-headers` middleware, and change:
```ts
res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
```
to:
```ts
res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
```
Restart the dev server. If this change is needed, commit it:
```bash
git -C /workspace add portfolio-website/vite.config.ts
git -C /workspace commit -m "fix(portfolio): relax COEP to credentialless for iframe Overview tab

require-corp blocks cross-origin iframe loads unless the iframe's
response sends Cross-Origin-Resource-Policy: cross-origin, which the
calculators Vercel deploy does not. credentialless is the standard
relaxation for this case."
```

If the console is clean, no action needed.

- [ ] **Step 10: Narrow viewport**

Resize the browser window to a narrow width (e.g. 375px). The iframe should:
- Stay at least 500px tall (`min-h-[500px]` floor).
- Not collapse or hide.
- The tab nav should wrap (already supported via `flex-wrap`).

- [ ] **Step 11: Final type-check and lint**

Run from `portfolio-website/`:
```bash
npx tsc -b
npm run lint 2>&1 | grep -E "(IframeTab|CalculatorsPage|tabs\.ts)" || echo "no lint errors in touched files"
```

Both should be clean for the touched files. (Pre-existing lint errors elsewhere are out of scope.)

- [ ] **Step 12: Status check**

```bash
git -C /workspace status
```

Expected: clean working tree (only `.DS_Store` and any pre-existing IDE files like `.vscode/settings.json` showing as untracked / modified). Nothing related to the iframe feature should be uncommitted.

---

## Self-Review Checklist Coverage

Mapping spec sections to tasks:

| Spec section | Task |
|---|---|
| Architecture: discriminated union | Task 1 step 1 |
| New `IframeTab` component | Task 1 step 2 |
| `CalculatorsPage` dispatch by `tab.kind` | Task 1 step 3 |
| Index redirect change to `overview` | Task 1 step 3 (`defaultTabSlug` auto-picks first tab) |
| Open-in-new-tab link | Task 1 step 2 |
| Thin border + rounded corners | Task 1 step 2 |
| `h-[calc(100vh-280px)] min-h-[500px]` sizing | Task 1 step 2 |
| `loading="lazy"` and `title` attribute | Task 1 step 2 |
| Tab order (Overview first) | Task 1 step 1 (array order) |
| COEP failure mode + relaxation fallback | Task 2 step 9 (c) |
| X-Frame-Options / CSP failure mode | Task 2 step 9 (a)/(b) |
| Tab switching regression | Task 2 step 7 |
| Narrow viewport | Task 2 step 10 |
| Final type-check + lint | Task 2 step 11 |
| Out-of-scope items (postMessage, sandbox, etc.) | Not implemented — correct. |
