<!--
  Use this template for PRs targeting the release branches `testnet` and `production`.
  GitHub will not automatically select a template by target branch; pick this template
  from the PR creation dropdown (or open this file and copy its contents) when opening
  a release PR.
-->

## Summary

<!--
  Describe the release briefly (e.g. "Merge latest changes from `main` into `testnet`").
  Fill in the incoming commits list below with each commit that is being merged.
-->

- 

## Incoming commits

<!--
  List every commit that is part of this release PR.
  Format each item as:

    - `<short-sha>` commit message ([commit message #NN](https://github.com/Moistbobo/sos-world-dashboard/pull/NN))

  Example:

    - `7cc15f4` chore: add scripts, move docs
    - `a5f7395` feat(api): add origin and IP allowlisting for API endpoints ([feat(api): add origin and IP allowlisting for API endpoints #109](https://github.com/Moistbobo/sos-world-dashboard/pull/109))

  Tip: generate the short-SHA/message list with:

    git log --reverse --pretty=format:"- \`%h\` %s" <target-branch>..<source-branch>
-->

- `<short-sha>` commit message
- `<short-sha>` commit message ([commit message #NN](https://github.com/Moistbobo/sos-world-dashboard/pull/NN))
- `<short-sha>` commit message ([commit message #NN](https://github.com/Moistbobo/sos-world-dashboard/pull/NN))

## Verification checklist

- [ ] `pnpm test` passes.
- [ ] `pnpm build` succeeds.
- [ ] `pnpm lint` is clean.
- [ ] Release branch diff reviewed for unexpected changes.
- [ ] No new console errors or broken network requests introduced.
