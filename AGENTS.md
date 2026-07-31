# hyouji — Agent Notes

A compact guide for OpenCode sessions working on this repo.

## Project at a glance

- Single-package Vite + React 19 SPA. Fully client-side; no backend.
- Production site is hosted on Vercel at `https://www.hyouji.moe`.
- Purpose: render HTML files from public GitHub Gists in a sandboxed iframe. Accepts `?gist=<url-or-id>`.
- Tooling: `pnpm`, Vite 8, TypeScript 6, Tailwind 4 (new `@import "tailwindcss"` v4 CSS config), Oxlint.

## Common commands

```bash
pnpm dev              # local dev server
pnpm build            # production build to dist/
pnpm build:gh-pages   # build with base path /hyouji/ for GitHub Pages
pnpm lint             # oxlint
pnpm preview          # preview the last production build
pnpm deploy           # runs build:gh-pages then gh-pages -d dist
```

There are no tests, typecheck, or formatter scripts in `package.json`. `tsc --noEmit` is not wired up, but `vite build` is the realistic verification step.

## Verification order

1. `pnpm lint`
2. `pnpm build` (catches TypeScript errors via the Vite/Rollup pipeline)
3. Manual browser check with a real Gist URL, e.g. `http://localhost:5173/?gist=<gist-url>`

## Build / deploy gotchas

- `vite.config.ts` sets `base` to `/hyouji/` **only** when `GITHUB_PAGES=true` during `build`. Normal `pnpm build` uses `/`.
- `homepage` in `package.json` is `https://moistbobo.github.io/hyouji/` — keep it aligned with the GitHub Pages base path.
- `pnpm deploy` publishes `dist/` via `gh-pages`; only run it when deployment is requested.
- `dist/` is in `.gitignore`; do not commit it.

## Architecture notes

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`.
- All routing is query-string based (`?gist=`). There is no router.
- Core modules:
  - `src/gist.ts` — parse gist URLs/IDs, fetch via `api.github.com`, filter HTML files.
  - `src/anchorShim.ts` — inject/remove a first-party script that rewrites in-document anchor links so they work inside `srcdoc` iframes when `allow-scripts` is enabled.
  - `src/ErrorBoundary.tsx` — catches runtime errors; the message blames browser extensions by design.
- `localStorage` key: `hyouji-allow-scripts` (boolean string). Persisted in `App.tsx`.

## Security surface (easy to regress)

- Preview iframe defaults to `sandbox=""` (maximum restriction). Opt-in `allow-scripts` only after user toggles it.
- `referrerPolicy="no-referrer"` on the iframe prevents leaking the page URL.
- Any change to sandbox flags or to `anchorShim.ts` should be treated as security-sensitive.

## Style / conventions

- Tailwind v4 CSS config in `src/index.css` uses `@theme { --color-... }` custom properties; utility classes reference those custom colors (e.g. `text-text`, `bg-surface`).
- Oxlint config enables React plugin rules: `react/rules-of-hooks` is `error`; `react/only-export-components` is `warn` with `allowConstantExport: true`.
- `.tsx` imports in the source keep the `.tsx` extension (TypeScript `allowImportingTsExtensions: true`, `noEmit: true`).

## Workflow conventions

- PR titles: `[TAG]: description` with tags like `[FEAT]`, `[FIX]`, `[DOCS]`, `[CHORE]`, `[REFACTOR]`, `[CI]`, `[TEST]`.
- Two PR templates exist:
  - `.github/PULL_REQUEST_TEMPLATE.md` for PRs targeting `main`.
  - `.github/PULL_REQUEST_TEMPLATE/release.md` for PRs targeting `testnet` or `production`.
- Default branch is `main`; `production` is used for release merges.
- The issue template is `.github/ISSUE_TEMPLATE/ticket.md`.
- All agents **must follow `CONTRIBUTING.md`** for PR title tags and template selection.

## Things that look like configuration but aren't used

- `pnpm-workspace.yaml` exists but contains only an unused `allowBuilds: puppeteer` line. This is effectively a single-package repo.
