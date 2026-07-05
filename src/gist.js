const GIST_URL_RE = /^https?:\/\/gist\.github\.com\/[^/]+\/([a-f0-9]+)(?:\/raw\/?)?(?:\?.*)?$/i;
const GIST_ID_RE = /^[a-f0-9]+$/i;

export function extractGistId(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(GIST_URL_RE);
  if (match) return match[1];

  if (GIST_ID_RE.test(trimmed) && trimmed.length >= 20) return trimmed;

  return null;
}

export async function fetchGist(gistId) {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API returned ${response.status}`);
  }
  return response.json();
}

export function findHtmlFiles(files) {
  return Object.values(files).filter(
    (file) =>
      file.filename.toLowerCase().endsWith('.html') ||
      (file.type && file.type.toLowerCase() === 'text/html')
  );
}

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
