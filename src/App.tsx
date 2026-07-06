import { useState, useCallback, useEffect, FormEvent } from 'react';
import {
  extractGistId,
  fetchGist,
  findHtmlFiles,
  escapeHtml,
  GistFile,
} from './gist.ts';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [files, setFiles] = useState<GistFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GistFile | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [uiVisible, setUiVisible] = useState(true);

  const loadFile = useCallback(async (file: GistFile) => {
    setSelectedFile(file);
    setUiVisible(false);

    let content: string;
    if (file.content != null) {
      content = file.content;
    } else if (file.raw_url) {
      const response = await fetch(file.raw_url);
      if (!response.ok) {
        setError(`Could not fetch ${escapeHtml(file.filename)}`);
        return;
      }
      content = await response.text();
    } else {
      setError('No content available for this file');
      return;
    }

    setPreviewContent(content);
  }, []);

  const loadGist = useCallback(async (inputUrl: string) => {
    setError(null);
    setInfo(null);
    setFiles([]);
    setSelectedFile(null);
    setPreviewContent('');

    const gistId = extractGistId(inputUrl);
    if (!gistId) {
      setError('Please enter a valid gist.github.com URL or a gist ID.');
      return;
    }

    setLoading(true);
    try {
      const gist = await fetchGist(gistId);
      const htmlFiles = findHtmlFiles(gist.files);

      if (htmlFiles.length === 0) {
        const fileNames =
          Object.values(gist.files)
            .map((f) => `<code>${escapeHtml(f.filename)}</code>`)
            .join(', ') || 'none';
        setError(`No HTML files found in this gist. Files: ${fileNames}.`);
        return;
      }

      setFiles(htmlFiles);
      setInfo(
        `Loaded gist by ${escapeHtml(gist.owner?.login || 'unknown')} — ${htmlFiles.length} HTML file${htmlFiles.length === 1 ? '' : 's'} found.`
      );
      await loadFile(htmlFiles[0]);
    } catch (err) {
      setError(`Failed to load gist: ${escapeHtml((err as Error).message)}`);
    } finally {
      setLoading(false);
    }
  }, [loadFile]);

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    await loadGist(url);
  }, [url, loadGist]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pastedUrl = searchParams.get('gist');

    if (pastedUrl) {
      const decoded = decodeURIComponent(pastedUrl);
      setUrl(decoded);
      loadGist(decoded);
      return;
    }

    if (!searchParams.has('gist')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('gist', '');
      window.history.replaceState(null, '', newUrl);
    }
  }, [loadGist]);

  const loadFileClick = useCallback((file: GistFile) => {
    setError(null);
    loadFile(file);
  }, [loadFile]);

  const showUi = uiVisible || !selectedFile;

  return (
    <div
      className={`app flex min-h-screen flex-col ${showUi ? '' : 'preview-only'}`}
    >
      {showUi && (
        <header className="mb-8 text-center">
          <h1 className="m-0 text-4xl font-bold tracking-tight">
            hyouji <span className="jp">表示</span>
          </h1>
          <p className="mt-2 text-text-muted">Preview HTML files stored in GitHub Gists</p>
        </header>
      )}

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6">
        {selectedFile && (
          <button
            type="button"
            className="ui-toggle fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface/65 text-xl text-text opacity-60 backdrop-blur-sm transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100"
            onClick={() => setUiVisible((v) => !v)}
            aria-label={uiVisible ? 'Hide hyouji UI' : 'Show hyouji UI'}
            title={uiVisible ? 'Hide UI' : 'Show UI'}
          >
            {uiVisible ? (
              '✕'
            ) : (
              <span className="jp">表示</span>
            )}
          </button>
        )}

        <form
          onSubmit={handleSubmit}
          className="input-group flex flex-wrap items-end gap-2.5 rounded-lg border border-border bg-surface p-5 shadow-lg"
          style={{ display: showUi ? undefined : 'none' }}
        >
          <label htmlFor="gist-url" className="w-full font-semibold text-sm">
            Gist ID
          </label>
          <input
            type="text"
            id="gist-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Gist ID, gist.github.com/username/abc123..., or username/hash"
            required
            className="min-w-[240px] flex-1 rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-base text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-muted"
          >
            {loading ? 'Loading…' : 'Load Gist'}
          </button>
        </form>

        {showUi && error && (
          <div
            className="message error mt-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
            dangerouslySetInnerHTML={{ __html: error }}
          />
        )}
        {showUi && info && (
          <div
            className="message info mt-4 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
            role="status"
            dangerouslySetInnerHTML={{ __html: info }}
          />
        )}

        {showUi && files.length > 0 && (
          <section className="files mt-8">
            <h2 className="mb-3 text-lg font-semibold text-text-muted">
              HTML files in this gist
            </h2>
            <ul className="file-list flex flex-wrap gap-2.5">
              {files.map((file) => (
                <li key={file.filename}>
                  <button
                    type="button"
                    className={`rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text transition-colors hover:border-accent hover:bg-surface-2 ${
                      selectedFile?.filename === file.filename
                        ? 'border-accent bg-accent text-white hover:bg-accent'
                        : ''
                    }`}
                    onClick={() => loadFileClick(file)}
                  >
                    {file.filename}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {selectedFile && (
          <section className="preview mt-8 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            {showUi && (
              <div className="preview-header border-b border-border bg-surface-2 px-4 py-3">
                <h2 className="m-0 text-sm font-semibold text-text-muted">
                  Preview: <code className="rounded bg-white/10 px-1.5 py-0.5 text-text">{selectedFile.filename}</code>
                </h2>
              </div>
            )}
            <iframe
              title={selectedFile.filename}
              srcDoc={previewContent}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              className="h-[70vh] min-h-[400px] w-full bg-white"
            />
          </section>
        )}
      </main>

      {showUi && (
        <footer className="mx-auto mt-12 max-w-[1100px] border-t border-border px-6 py-6 text-center text-xs text-text-muted">
          <p>hyouji loads HTML from public GitHub Gists and renders it in a sandboxed iframe.</p>
          <p className="mt-1">
            Usage: <code className="rounded bg-white/10 px-1 py-0.5">{window.location.origin}/?gist=&lt;url to your gist&gt;</code>
          </p>
        </footer>
      )}
    </div>
  );
}
