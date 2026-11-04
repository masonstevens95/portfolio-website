# masonstevens.dev

Vite + React SPA on Vercel, with a small set of Vercel functions for the plans storefront.

## Commands

- `npm run dev`: the site only (no `/api`). Plans render, and Buy is hidden unless `VITE_STRIPE_MODE` is set.
- `npm test`: vitest (catalog, server logic, brand guardrail).
- `npm run build`: typechecks `src/`, `vite.config.ts`, and `api/` + `server/`, then builds. Fails if `VITE_STRIPE_MODE` disagrees with the Stripe key.

## Plans storefront

`/plans` sells SketchUp build plans through Stripe Checkout, with downloads served from a private Vercel Blob store. Setup, environment variables, the pre-launch checklist and operations are in [`docs/plans-storefront-runbook.md`](../docs/plans-storefront-runbook.md).

Running the functions locally:

1. `vercel link` (once), then `vercel env pull .env.local`. This gets the test-mode Stripe and Resend variables and the Blob OIDC token.
2. `vercel dev`. It serves the site and `api/` on `http://localhost:3000`.
3. In another terminal, `stripe listen --forward-to localhost:3000/api/stripe-webhook`. Put the printed `whsec_…` in `.env.local` as `STRIPE_WEBHOOK_SECRET`.

Server code under `api/` and `server/` is native ESM on Node. Relative imports **must** end in `.js`, and `tsconfig.server.json` (NodeNext) enforces that.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
