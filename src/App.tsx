import { useState, useCallback, useEffect, FormEvent } from 'react';
import {
  extractGistId,
  fetchGist,
  findHtmlFiles,
  GistFile,
} from './gist.ts';
import { injectAnchorShim, removeAnchorShim } from './anchorShim.ts';
import {
  loadHistory,
  recordView,
  removeFromHistory,
  clearHistory,
  HistoryEntry,
} from './history.ts';
import HistoryModal from './HistoryModal.tsx';
import ConfirmModal from './ConfirmModal.tsx';

const DEFAULT_TITLE = 'hyouji — Preview HTML from GitHub Gists';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [files, setFiles] = useState<GistFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GistFile | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [uiVisible, setUiVisible] = useState(true);
  const [allowScripts, setAllowScripts] = useState(
    () => localStorage.getItem('hyouji-allow-scripts') === 'true'
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      document.title = DEFAULT_TITLE;
    }
  }, [selectedFile]);

  const handleScriptToggle = useCallback(() => {
    setAllowScripts((prev) => {
      const next = !prev;
      localStorage.setItem('hyouji-allow-scripts', String(next));
      return next;
    });
  }, []);

  const loadFile = useCallback(async (file: GistFile, ownerLogin?: string) => {
    setSelectedFile(file);

    const owner = ownerLogin || 'unknown';
    document.title = `hyouji — ${file.filename} · ${owner}`;

    let content: string;
    if (file.content != null) {
      content = file.content;
    } else if (file.raw_url) {
      const response = await fetch(file.raw_url);
      if (!response.ok) {
        setError(`Could not fetch ${file.filename}`);
        return;
      }
      content = await response.text();
    } else {
      setError('No content available for this file');
      return;
    }

    if (allowScripts) {
      content = injectAnchorShim(content);
    } else {
      content = removeAnchorShim(content);
    }

    setPreviewContent(content);
  }, [allowScripts]);

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
            .map((f) => f.filename)
            .join(', ') || 'none';
        setError(`No HTML files found in this gist. Files: ${fileNames}.`);
        return;
      }

      setFiles(htmlFiles);
      const ownerLogin = gist.owner?.login || 'unknown';
      setInfo(
        `Loaded gist by ${ownerLogin} — ${htmlFiles.length} HTML file${htmlFiles.length === 1 ? '' : 's'} found.`
      );
      setHistory(
        recordView({
          id: gistId,
          ownerLogin,
          filenames: htmlFiles.map((f) => f.filename),
        })
      );
      await loadFile(htmlFiles[0], ownerLogin);
    } catch (err) {
      setError(`Failed to load gist: ${(err as Error).message}`);
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

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setHistoryOpen(false);
    const gistUrl = `https://gist.github.com/${entry.ownerLogin}/${entry.id}`;
    setUrl(gistUrl);
    loadGist(gistUrl);
  }, [loadGist]);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(removeFromHistory(id));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory(clearHistory());
    setConfirmClearOpen(false);
  }, []);

  const showUi = uiVisible || !selectedFile;

  return (
    <div
      className={`app flex min-h-screen flex-col ${showUi ? '' : 'preview-only'}`}
    >
      {!selectedFile && (
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="fixed top-4 left-4 z-50 inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface/65 px-4 text-sm font-semibold text-text opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100"
          aria-label="Open history"
          title="History"
        >
          History
          {history.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
              {history.length}
            </span>
          )}
        </button>
      )}
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
          <label className="flex w-full items-center gap-2 pt-1 text-xs text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowScripts}
              onChange={handleScriptToggle}
              className="accent-amber-500"
            />
            <span>
              Allow scripts — enables interactive demos but lets the gist execute arbitrary code in a sandboxed environment. Only enable for gists you trust.
            </span>
          </label>
        </form>

        {showUi && error && (
          <div
            className="message error mt-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        )}
        {showUi && info && (
          <div
            className="message info mt-4 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
            role="status"
          >
            {info}
          </div>
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
              <div className="preview-header flex items-center justify-between gap-4 border-b border-border bg-surface-2 px-4 py-3">
                <h2 className="m-0 text-sm font-semibold text-text-muted">
                  Preview: <code className="rounded bg-white/10 px-1.5 py-0.5 text-text">{selectedFile.filename}</code>
                </h2>
                <button
                  type="button"
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
                  onClick={() => setUiVisible(false)}
                >
                  View fullscreen
                </button>
              </div>
            )}
            <iframe
              title={selectedFile.filename}
              srcDoc={previewContent}
              sandbox={allowScripts ? 'allow-scripts' : ''}
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

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={history}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClearAll={() => setConfirmClearOpen(true)}
      />

      <ConfirmModal
        open={confirmClearOpen}
        title="Clear history?"
        message={
          <>
            This will remove all {history.length}{' '}
            gist{history.length === 1 ? '' : 's'} from your local history. This
            cannot be undone.
          </>
        }
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleClearHistory}
        onClose={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
