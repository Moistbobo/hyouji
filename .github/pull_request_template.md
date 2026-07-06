<!--
  Instructions for agents and contributors:
  - Keep the sections below filled in; do not delete them.
  - Remove any checklist items or subsection comments that are genuinely not applicable, but state why in the PR description.
  - Non-visual PRs (e.g. dependency bumps, config changes, refactors with no UI/UX impact) may skip screenshots/video, but must still explain why in the E2E Evidence section.
  - For PRs targeting `testnet` or `production`, use the release template instead:
    `.github/PULL_REQUEST_TEMPLATE/release.md`
-->

## Summary

-

## RISK RATING

> **Review effort guide for humans. Agents must fill in the impact badge and rationale before requesting review.**

### Overall risk

Pick **one** badge and delete the others:

- ![low](https://img.shields.io/badge/risk-low-green) — isolated change, limited files, no auth/security surface, no schema/env changes, well-covered by tests.
- ![medium](https://img.shields.io/badge/risk-medium-orange) — touches shared components/pages, adds a dependency, changes data fetching shape, or involves user input/auth but follows existing patterns.
- ![high](https://img.shields.io/badge/risk-high-red) — broad refactor, security-sensitive code, auth/token handling, schema migration, feature flag wiring, or changes that could break core user flows across the app.

### Rationale

- **Scope**:
- **Blast radius**:
- **Data/schema changes**:
- **Auth/security concerns**:
- **Dependencies / external services**:

### Security concerns

- None

## E2E Evidence

> **Agents must provide proof that the implementation works in a real browser for user-facing/UI changes. Attach screenshots, screen recordings, GIFs, or a link to a short Loom/Cloudinary clip below. Contributors may use the same section.**

### Is this PR user-facing?

- [ ] Yes — UI/UX was added or changed (screenshots/video required below).
- [ ] No — only non-visual code/config/test changes (explain why media is skipped).

### How to capture evidence

1. Run the app: `pnpm dev` (or `pnpm build && pnpm preview` for a production-like build).
2. Exercise the feature/flow in a browser at the relevant routes.
3. Capture:
   - **Screenshots** of the new/changed UI (at least one before/after or happy-path state).
   - **Screen recording** (preferred for flows >1 step, e.g. rating a world, posting a comment, navigating with filters). Use QuickTime, Loom, or `ffmpeg`/`asciinema` for CLI demos.
4. Attach media **directly to the PR body** by dragging the files into the GitHub text area.
5. For terminal-only workflows, create a public gist and embed the raw image URLs:
   ```bash
   gh gist create pr-assets/<branch-name>/*.png --public --desc "E2E screenshots for <branch-name>"
   ```
   Open the created gist, click each image, and copy its **raw URL** (`https://gist.githubusercontent.com/<user>/<gist-id>/raw/<filename>`). Embed it as:
   ```markdown
   ![alt text](https://gist.githubusercontent.com/<user>/<gist-id>/raw/world-detail_light.png)
   ```
   Do not upload `.env` files, logs, build artifacts, or screenshots containing secrets/PII.

### Attachments

- [ ] Screenshot(s) attached
- [ ] Screen recording / video / GIF attached (preferred for flows)
- [ ] If the change is invisible, explain why no media is needed and what was verified instead.

#### Example side-by-side layout

| Light | Dark |
|---|---|
| `<img src="LIGHT_URL" alt="..." width="100%" />` | `<img src="DARK_URL" alt="..." width="100%" />` |

### Verification checklist

- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds.
- [ ] `pnpm lint` is clean.
- [ ] Feature manually exercised in the browser (or automated E2E test ran, if applicable).
- [ ] No new console errors or broken network requests introduced.
- [ ] Dark mode and mobile widths checked when UI changed.
- [ ] Feature flag behavior verified if the PR touches a flagged feature.

## Test Plan

-

## Deployment / Release Notes

-
