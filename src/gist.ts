const GIST_URL_RE = /^https?:\/\/gist\.github\.com\/[^/]+\/([a-f0-9]+)(?:\/raw\/?)?(?:\?.*)?$/i;
const GIST_RAW_URL_RE = /^https?:\/\/gist\.githubusercontent\.com\/[^/]+\/([a-f0-9]+)\b/i;
const GIST_ID_RE = /^[a-f0-9]+$/i;

export interface GistFile {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
  content?: string;
}

export interface GistOwner {
  login: string;
}

export interface Gist {
  id: string;
  files: Record<string, GistFile>;
  owner: GistOwner | null;
}

export function extractGistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(GIST_URL_RE) || trimmed.match(GIST_RAW_URL_RE);
  if (match) return match[1];

  if (GIST_ID_RE.test(trimmed) && trimmed.length >= 20) return trimmed;

  return null;
}

export async function fetchGist(gistId: string): Promise<Gist> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message || `GitHub API returned ${response.status}`);
  }
  return response.json();
}

export function findHtmlFiles(files: Record<string, GistFile>): GistFile[] {
  return Object.values(files).filter(
    (file) =>
      file.filename.toLowerCase().endsWith('.html') ||
      (file.type && file.type.toLowerCase() === 'text/html')
  );
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
