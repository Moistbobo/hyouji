# hyouji 表示

Preview HTML files stored in public GitHub Gists in a sandboxed iframe — directly in your browser.

The name comes from the Japanese word [表示](https://jisho.org/search/%E8%A1%A8%E7%A4%BA) (*hyouji*), meaning "display" or "show."

## How it works

hyouji is a fully client-side single-page application. There is no backend, no server, and no data storage — everything happens in your browser.

### Gist fetching

When you provide a gist URL or ID, hyouji parses it using `extractGistId()`, which accepts multiple input formats:

- Full gist URL: `https://gist.github.com/username/abc123`
- Raw gist URL: `https://gist.githubusercontent.com/username/abc123/raw`
- Shorthand: `username/abc123`
- Bare ID: `abc123`

It then calls the GitHub REST API (`GET /gists/{id}`) to retrieve the gist metadata — file list, owner, and raw content URLs. Only files with a `.html` extension or `text/html` MIME type are kept. When you select a file to preview, its content is fetched either from the API response body or from the file's `raw_url` endpoint.

### Security

Security is a core design concern. The preview is rendered inside an `<iframe>` with the `sandbox` attribute set to an empty string by default, which imposes the maximum set of restrictions:

- No script execution
- No form submission
- No popups
- No navigation
- No same-origin access
- No top-level navigation

An optional "Allow scripts" toggle adds `allow-scripts` to the sandbox attribute, enabling JavaScript execution for interactive demos while still blocking forms, popups, and navigation. This preference is persisted in `localStorage`.

Additional protections include:

- `referrerPolicy="no-referrer"` prevents the iframe content from leaking the page URL
- Fully client-side — gist content is fetched directly from GitHub by your browser and never touches a server
- A React error boundary catches runtime errors gracefully without crashing the page
