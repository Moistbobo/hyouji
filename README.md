# hyouji 表示

Preview HTML files from public GitHub Gists in a sandboxed iframe, in your browser.

The name comes from the Japanese word [表示](https://jisho.org/search/%E8%A1%A8%E7%A4%BA) (*hyouji*), meaning "display" or "show."

## How it works

hyouji is a client-side single-page app. No backend and no server. Your browser does the work.

### Gist fetching

Give hyouji a gist URL or ID and it parses it with `extractGistId()`, which takes:

- Full gist URL: `https://gist.github.com/username/abc123`
- Raw gist URL: `https://gist.githubusercontent.com/username/abc123/raw`
- Shorthand: `username/abc123`
- Bare ID: `abc123`

hyouji then calls the GitHub REST API (`GET /gists/{id}`) for the gist metadata: the file list, owner, and raw content URLs. It keeps only files with a `.html` extension or a `text/html` MIME type. Selecting a file fetches its content from the API response body or the file's `raw_url`.

### Storage

hyouji keeps two things in your browser's `localStorage`, and nothing else:

- `hyouji-history-v1`: the gists you have viewed. Each entry stores the gist ID, owner, the HTML filenames, and when you first and last opened it, capped at the 50 most recent.
- `hyouji-allow-scripts`: whether the "Allow scripts" toggle is on.

Both stay on your device. Delete history entries one at a time or clear the whole list from the History panel, or clear site data to remove both.

### Security

The preview runs in an `<iframe>` with `sandbox` set to an empty string by default, the strictest setting. Gist content can't run scripts, submit forms, open popups, or navigate, and it can't reach the parent page or its origin.

An optional "Allow scripts" toggle adds `allow-scripts` so interactive demos work. Forms, popups, and navigation stay blocked.

- `referrerPolicy="no-referrer"` keeps the iframe from leaking the page URL.
- Your browser fetches gist content straight from GitHub, so it never passes through a hyouji server.
- A React error boundary catches runtime errors and shows a message instead of blanking the page.
