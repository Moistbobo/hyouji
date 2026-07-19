import { useEffect, useRef } from 'react';
import type { HistoryEntry } from './history.ts';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryModal({
  open,
  onClose,
  entries,
  onSelect,
  onDelete,
}: HistoryModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);

    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-lg border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="history-modal-title" className="m-0 text-lg font-semibold">
            History
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-text transition-colors hover:bg-surface-2"
            onClick={onClose}
            aria-label="Close history"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {entries.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-text-muted">
              No gists viewed yet
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-text transition-colors hover:border-border hover:bg-surface-2 focus-within:border-border focus-within:bg-surface-2"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left outline-none"
                    onClick={() => onSelect(entry)}
                    aria-label={`Load gist ${entry.id} by ${entry.ownerLogin}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <span className="text-text-muted">{entry.ownerLogin}</span>
                          <span className="text-text-muted">/</span>
                          <span className="truncate font-mono text-xs">{entry.id}</span>
                        </span>
                        {entry.filenames.length > 0 && (
                          <span className="mt-0.5 block truncate text-xs text-text-muted">
                            {entry.filenames.join(', ')}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-text-muted">
                        {formatRelative(entry.lastViewedAt)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent text-text-muted transition-colors hover:border-error/40 hover:bg-error/10 hover:text-error focus-visible:border-error/40 focus-visible:bg-error/10 focus-visible:text-error focus-visible:outline-none"
                    onClick={() => onDelete(entry.id)}
                    aria-label={`Remove ${entry.id} from history`}
                    title="Remove from history"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
