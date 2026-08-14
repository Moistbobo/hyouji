export interface HistoryEntry {
  id: string;
  ownerLogin: string;
  filenames: string[];
  firstViewedAt: number;
  lastViewedAt: number;
}

interface HistoryStore {
  version: 1;
  entries: HistoryEntry[];
}

const STORAGE_KEY = 'hyouji-history-v1';
const MAX_ENTRIES = 50;

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.ownerLogin === 'string' &&
    Array.isArray(v.filenames) &&
    v.filenames.every((f) => typeof f === 'string') &&
    typeof v.firstViewedAt === 'number' &&
    typeof v.lastViewedAt === 'number'
  );
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Partial<HistoryStore> | null;
    if (!data || !Array.isArray(data.entries)) return [];
    return data.entries.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    const store: HistoryStore = { version: 1, entries };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage failures (e.g. quota exceeded or private mode).
  }
}

export interface RecordViewInput {
  id: string;
  ownerLogin: string;
  filenames: string[];
}

export function recordView({ id, ownerLogin, filenames }: RecordViewInput): HistoryEntry[] {
  const all = loadHistory();
  const now = Date.now();
  const existing = all.find((e) => e.id === id);

  let next: HistoryEntry[];
  if (existing) {
    const merged = Array.from(new Set([...existing.filenames, ...filenames]));
    const updated: HistoryEntry = {
      ...existing,
      ownerLogin,
      filenames: merged,
      lastViewedAt: now,
    };
    next = all.map((e) => (e.id === id ? updated : e));
  } else {
    next = [
      {
        id,
        ownerLogin,
        filenames,
        firstViewedAt: now,
        lastViewedAt: now,
      },
      ...all,
    ];
  }

  next.sort((a, b) => b.lastViewedAt - a.lastViewedAt);
  const trimmed = next.slice(0, MAX_ENTRIES);
  saveHistory(trimmed);
  return trimmed;
}

export function removeFromHistory(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  saveHistory([]);
  return [];
}
