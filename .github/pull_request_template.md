<!--
  Instructions for agents and contributors:
  - Keep the sections below filled in; do not delete them.
  - Remove any checklist items or subsection comments that are genuinely not applicable, but state why in the PR description.
  - For PRs targeting `testnet` or `production`, use the release template instead:
    `.github/PULL_REQUEST_TEMPLATE/release.md`
-->

## Summary

<!-- What does this PR do and why? Keep it concise (2-4 bullets) and link any related issues. -->

- 

## RISK RATING

> **Review effort guide for humans. Agents must fill in the impact badge and rationale before requesting review.**

### Overall risk

Pick **one** badge and delete the others:

- ![low](https://img.shields.io/badge/risk-low-green) — isolated change, limited files, no auth/security surface, no schema/env changes, well-covered by tests.
- ![medium](https://img.shields.io/badge/risk-medium-orange) — touches shared components/pages, adds a dependency, changes data fetching shape, or involves user input/auth but follows existing patterns.
- ![high](https://img.shields.io/badge/risk-high-red) — broad refactor, security-sensitive code, auth/token handling, schema migration, feature flag wiring, or changes that could break core user flows across the app.

### Rationale

<!-- Bulleted explanations, ideally with links to relevant GitHub diff lines. Use paths or `https://github.com/.../pull/NN/files#diff-...` style links. -->

- **Scope**: 
- **Blast radius**: 
- **Data/schema changes**: 
- **Auth/security concerns**: 
- **Dependencies / external services**: 

### Security concerns

<!-- Call out anything a reviewer should scrutinize: new fetch endpoints, token handling, XSS/CSRF exposure, env-var requirements, package supply-chain risks, etc. Delete this subsection only if genuinely none apply. -->

- None

## Test Plan

<!-- What did you test, and how? Include command snippets if useful. -->

- 

## Deployment / Release Notes

<!-- Optional. Mention any required env vars, migrations, feature flags, or post-deploy checks. -->

- 
