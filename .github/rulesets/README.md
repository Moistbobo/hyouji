# Repository Rulesets

These JSON files are the source-of-truth definitions for the repository's branch rulesets. They are applied to GitHub via the REST API (or `scripts/apply-rulesets.sh`).

| Ruleset | Branches | Merge method allowed |
|---|---|---|
| `main` | Default branch (`main`) | Squash only |
| `release-branches` | `testnet`, `production` | Merge commit only |

Both rulesets also:

- Block branch deletion (`deletion`)
- Block force pushes (`non_fast_forward`)
- Require changes to come through a pull request (`pull_request`)
