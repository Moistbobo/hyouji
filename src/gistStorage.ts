export const GIST_STORAGE_PREFIX = 'hyouji-gist:';

export interface GistStorageMessage {
  hyouji: true;
  ns: string;
  type: 'setAll';
  data: Record<string, string>;
}

export function buildStorageKey(gistId: string): string {
  return `${GIST_STORAGE_PREFIX}${gistId}`;
}

export function readGistStorage(gistId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(buildStorageKey(gistId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore corrupt storage
  }
  return {};
}

export function writeGistStorage(
  gistId: string,
  data: Record<string, string>
): void {
  try {
    localStorage.setItem(buildStorageKey(gistId), JSON.stringify(data));
  } catch {
    // ignore quota / privacy errors
  }
}

export function clearGistStorage(gistId: string): void {
  try {
    localStorage.removeItem(buildStorageKey(gistId));
  } catch {
    // ignore
  }
}

export function generateShimScript(
  gistId: string,
  initialData: Record<string, string>
): string {
  const ns = buildStorageKey(gistId);
  const encodedData = JSON.stringify(initialData);
  const code = `
(function () {
  'use strict';
  var NS = ${JSON.stringify(ns)};
  var store = ${encodedData};
  var listeners = [];

  function post(type, payload) {
    try {
      window.parent.postMessage({ hyouji: true, ns: NS, type: type, data: payload }, '*');
    } catch (e) {}
  }

  function dispatchFakeStorageEvent(key, oldValue, newValue) {
    try {
      var event = document.createEvent('StorageEvent');
      event.initStorageEvent('storage', false, false, key, oldValue, newValue, window.location.href, window.localStorage);
      window.dispatchEvent(event);
    } catch (e) {}
  }

  var shim = {
    get length() {
      return Object.keys(store).length;
    },
    key: function (index) {
      var keys = Object.keys(store);
      return keys[index] === undefined ? null : keys[index];
    },
    getItem: function (key) {
      return store[key] === undefined ? null : store[key];
    },
    setItem: function (key, value) {
      var stringValue = String(value);
      var oldValue = store[key] === undefined ? null : store[key];
      store[key] = stringValue;
      post('setAll', store);
      dispatchFakeStorageEvent(key, oldValue, stringValue);
    },
    removeItem: function (key) {
      var oldValue = store[key] === undefined ? null : store[key];
      delete store[key];
      post('setAll', store);
      dispatchFakeStorageEvent(key, oldValue, null);
    },
    clear: function () {
      store = {};
      post('setAll', store);
      dispatchFakeStorageEvent(null, null, null);
    }
  };

  window.localStorage = shim;

  window.addEventListener('message', function (event) {
    try {
      var data = event.data;
      if (!data || data.hyouji !== true || data.ns !== NS || data.type !== 'sync') return;
      if (data.data && typeof data.data === 'object') {
        store = data.data;
        dispatchFakeStorageEvent(null, null, null);
      }
    } catch (e) {}
  });
})();
  `.trim();

  return `<script>${code}</script>`;
}

export function injectShim(
  html: string,
  gistId: string,
  initialData: Record<string, string>
): string {
  const shim = generateShimScript(gistId, initialData);
  const lower = html.toLowerCase();
  const headIndex = lower.indexOf('</head>');
  if (headIndex >= 0) {
    return html.slice(0, headIndex) + shim + html.slice(headIndex);
  }
  const bodyIndex = lower.indexOf('<body');
  if (bodyIndex >= 0) {
    const closeAngle = lower.indexOf('>', bodyIndex);
    if (closeAngle >= 0) {
      return html.slice(0, closeAngle + 1) + shim + html.slice(closeAngle + 1);
    }
  }
  return shim + html;
}

export function isGistStorageMessage(data: unknown): data is GistStorageMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return (
    msg.hyouji === true &&
    typeof msg.ns === 'string' &&
    msg.type === 'setAll' &&
    typeof msg.data === 'object' &&
    msg.data !== null &&
    !Array.isArray(msg.data)
  );
}
