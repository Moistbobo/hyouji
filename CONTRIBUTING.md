# Contributing

## Pull Request Templates

This repo has two PR templates. Use the correct one based on your target branch:

| Template | File | When to use |
|---|---|---|
| Default | `.github/PULL_REQUEST_TEMPLATE.md` | PRs targeting `main` |
| Release | `.github/PULL_REQUEST_TEMPLATE/release.md` | PRs targeting `testnet` or `production` |

GitHub always pre-fills the default template. For release PRs, select `release.md` from the "Add a template" dropdown when opening the PR, or copy its contents manually.

## Pull Request Title Convention

Use a single major tag in square brackets, followed by a colon and a short description.

```
[FEAT]: add user profile page
[FIX]: correct pagination offset
[DOCS]: update API authentication instructions
[CHORE]: upgrade dependencies
[REFACTOR]: simplify component layout
[CI]: fix deployment workflow
[TEST]: add integration tests for login flow
```

## Issue Templates

Use `.github/ISSUE_TEMPLATE/ticket.md` when filing issues. It supports bugs, features, and chores in a single form.

### Previs for UI/UX tickets

If a ticket touches UI/UX, include a visual previs:

1. Create a self-contained HTML file with inlined CSS/images.
2. Upload it as a [GitHub Gist](https://gist.github.com).
3. Embed it using the Hyouji HTML renderer: `https://www.hyouji.moe/?gist=https://gist.github.com/<user>/<gist-id>`
