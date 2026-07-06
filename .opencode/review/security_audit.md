# Security Audit: hyouji

**Date:** 2026-07-07
**Scope:** Full repository audit (excluding `.gitignore`-ignored files)
**Type:** Static analysis / manual code review

---

## Summary

hyouji is a client-only React SPA that fetches public GitHub Gists and renders their HTML files in a sandboxed iframe. The attack surface is limited — no server, no database, no authentication — but the app's core function (fetching and rendering untrusted HTML) introduces meaningful risk.

**Risk rating:** Medium

---

## Findings

### H-1: `dangerouslySetInnerHTML` with user-influenced data

**File:** `src/App.jsx:170,177`
**Severity:** High
**Status:** Currently mitigated, pattern is fragile

The error and info message containers use `dangerouslySetInnerHTML`:

```jsx
<div dangerouslySetInnerHTML={{ __html: error }} />
<div dangerouslySetInnerHTML={{ __html: info }} />
```

All call sites currently wrap user data with `escapeHtml()` (defined in `src/gist.js:34`), which prevents XSS today. However, this is a brittle pattern — any future contributor who adds a new error/info message and forgets to call `escapeHtml()` will introduce a stored XSS vulnerability. The gist owner login, filenames, and error messages are all attacker-influenced values.

**Recommendation:** Replace `dangerouslySetInnerHTML` with React's normal text rendering (`{error}`, `{info}`). The only reason HTML was needed is the `<code>` tags in the file-names error message (line 62-63). Instead, build a React element tree:

```jsx
// Instead of building HTML strings, use React elements
const fileNames = Object.values(gist.files).map(f => (
  <code key={f.filename}>{f.filename}</code>
));
```

---

### M-1: iframe sandbox allows arbitrary script execution

**File:** `src/App.jsx:218`
**Severity:** Medium
**Status:** Accepted risk (by design)

The preview iframe uses `sandbox="allow-scripts"` with no `allow-same-origin`. This correctly prevents the gist content from accessing the parent page's DOM, cookies, or storage. However, `allow-scripts` permits arbitrary JavaScript execution within the iframe's isolated origin. An attacker can craft a gist that:
- Mines cryptocurrency
- Performs network requests (fetch, XHR) to external servers
- Fingerprints the visitor's browser
- Redirects the iframe to phishing pages

This is inherent to the app's purpose (previewing HTML), but users should be aware they are executing untrusted code in their browser.

**Recommendation:** Add a visible warning banner when loading a gist: "You are previewing untrusted HTML. This code can execute JavaScript in a sandboxed environment." Consider adding `allow-scripts allow-same-origin` only if absolutely needed (currently it is not).

---

### L-1: No Content-Security-Policy headers

**File:** `vite.config.js`
**Severity:** Low
**Status:** Missing

The Vite config does not set any CSP headers. While the iframe is sandboxed, the main application page has no CSP protection against XSS in the main window context.

**Recommendation:** Add CSP headers via Vite's `headers` config or a middleware:

```js
// vite.config.js
export default defineConfig({
  // ...
  server: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; connect-src 'self' https://api.github.com; frame-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
    },
  },
})
```

For production (Vercel/GitHub Pages), configure CSP via platform headers or a `<meta>` tag in `index.html`.

---

### L-2: Unauthenticated GitHub API calls subject to rate limiting

**File:** `src/gist.js:18`
**Severity:** Low
**Status:** Accepted

The app calls `https://api.github.com/gists/${gistId}` without authentication. Unauthenticated requests are rate-limited to 60 requests per hour per IP. If multiple users share an IP (e.g., corporate NAT), the app will fail for all users once the limit is hit.

**Recommendation:** Accept a `?token=` query parameter (or a configurable env var at build time) to pass a GitHub personal access token, increasing the limit to 5,000 req/hr. Document this for power users.

---

### L-3: HTTP URLs accepted for gist input

**File:** `src/gist.js:1-2`
**Severity:** Low
**Status:** Accepted

The regex patterns accept both `http://` and `https://` gist URLs. While the actual API call always uses HTTPS (hardcoded), accepting `http://` URLs could mislead users about the security of their connection to GitHub.

**Recommendation:** Reject `http://` URLs in `extractGistId` or auto-upgrade them to `https://`.

---

### I-1: No secrets found in git history

**Severity:** Info
**Status:** Clean

Scanned all commits and current files for API keys, tokens, passwords, and credentials. No secrets found.

---

### I-2: No server-side attack surface

**Severity:** Info
**Status:** Clean

The app is a purely static client-side SPA. There is no backend, no database, no authentication system, no session management, and no server-side input processing. The entire attack surface is client-side.

---

## Attack Surface Summary

| Vector | Exposure | Notes |
|---|---|---|
| XSS (main window) | Low (mitigated) | `dangerouslySetInnerHTML` pattern is fragile |
| XSS (iframe) | High (by design) | Gist HTML executes with `allow-scripts` |
| CSRF | None | No state-changing endpoints |
| SSRF | None | No server-side fetch |
| SQLi | None | No database |
| Auth bypass | None | No auth |
| Secrets leak | None | No secrets in repo |
| Supply chain | Low | Standard npm dependencies |
| Rate limiting | Medium | 60 req/hr unauthenticated GitHub API |

---

## Recommendations (Priority Order)

1. **HIGH** — Refactor `dangerouslySetInnerHTML` to use React elements (eliminate XSS vector entirely)
2. **MEDIUM** — Add user-facing warning about untrusted iframe content
3. **LOW** — Add CSP headers for defense-in-depth
4. **LOW** — Support optional GitHub token for higher API rate limits
5. **LOW** — Reject or auto-upgrade `http://` gist URLs
